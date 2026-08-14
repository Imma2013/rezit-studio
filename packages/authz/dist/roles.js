"use strict";
// Workspace roles and isolation. This is the
// security keystone: every API route and the realtime gateway call assertMember
// before touching workspace-scoped data, so there is no code path that reads or
// writes across a workspace the user does not belong to.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthzError = exports.ROLE_RANK = void 0;
exports.roleAtLeast = roleAtLeast;
exports.membershipOf = membershipOf;
exports.assertMember = assertMember;
exports.canAccess = canAccess;
exports.accessibleWorkspaceIds = accessibleWorkspaceIds;
exports.scopeToMemberships = scopeToMemberships;
/** Higher rank = more authority. */
exports.ROLE_RANK = {
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4,
};
class AuthzError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "AuthzError";
    }
}
exports.AuthzError = AuthzError;
/** True when `role` meets or exceeds `min`. */
function roleAtLeast(role, min) {
    return exports.ROLE_RANK[role] >= exports.ROLE_RANK[min];
}
/** The user's active membership in a workspace, or undefined. */
function membershipOf(memberships, userId, workspaceId) {
    return memberships.find((m) => m.userId === userId && m.workspaceId === workspaceId);
}
/**
 * Assert the user is an active member of the workspace with at least `minRole`,
 * returning the membership for downstream per-design checks. Throws
 * AuthzError otherwise. `minRole` defaults to viewer (any active member).
 */
function assertMember(memberships, userId, workspaceId, minRole = "viewer") {
    const m = membershipOf(memberships, userId, workspaceId);
    if (!m)
        throw new AuthzError("not-a-member", `user ${userId} is not a member of workspace ${workspaceId}`);
    if (m.status !== "active")
        throw new AuthzError("not-active", `membership is ${m.status}`);
    if (!roleAtLeast(m.role, minRole)) {
        throw new AuthzError("insufficient-role", `role ${m.role} is below required ${minRole}`);
    }
    return m;
}
/** Non-throwing membership/role check. */
function canAccess(memberships, userId, workspaceId, minRole = "viewer") {
    const m = membershipOf(memberships, userId, workspaceId);
    return !!m && m.status === "active" && roleAtLeast(m.role, minRole);
}
/** The set of workspace ids a user may access (active memberships only). */
function accessibleWorkspaceIds(memberships, userId) {
    return memberships
        .filter((m) => m.userId === userId && m.status === "active")
        .map((m) => m.workspaceId);
}
/**
 * Filter a list of workspace-scoped rows to those in workspaces the user may
 * access (FR-16). The single choke point used by query helpers so no
 * cross-workspace read can leak.
 */
function scopeToMemberships(rows, memberships, userId) {
    const allowed = new Set(accessibleWorkspaceIds(memberships, userId));
    return rows.filter((r) => allowed.has(r.workspaceId));
}
