"use strict";
// Workspace lifecycle invariants. A personal
// workspace is auto-provisioned per user and can never be deleted while the
// account exists; a workspace must always retain at least one owner.
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalWorkspaceFor = personalWorkspaceFor;
exports.canDeleteWorkspace = canDeleteWorkspace;
exports.canRemoveMember = canRemoveMember;
exports.canChangeRole = canChangeRole;
const roles_1 = require("./roles");
function slugify(s) {
    // Collapse runs of non-alphanumerics to a single "-", so at most one leading
    // and one trailing "-" can remain; trim those with single-character anchored
    // replaces instead of `/^-+|-+$/g`, whose two `+` quantifiers backtrack
    // quadratically on an all-separator input.
    const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return base.replace(/^-/, "").replace(/-$/, "").slice(0, 48) || "workspace";
}
/** The personal workspace auto-provisioned on first sign-in (FR-2). */
function personalWorkspaceFor(user, id, now) {
    return {
        id,
        kind: "personal",
        name: `${user.name || "My"} Workspace`,
        slug: slugify(`${user.name || user.email}-${id.slice(0, 6)}`),
        ownerId: user.id,
        createdAt: now,
    };
}
/** Personal workspaces can never be deleted while the account exists. */
function canDeleteWorkspace(ws) {
    return ws.kind !== "personal";
}
function owners(memberships, workspaceId) {
    return memberships.filter((m) => m.workspaceId === workspaceId && m.role === "owner" && m.status === "active");
}
/** A workspace must always keep at least one active owner. */
function canRemoveMember(memberships, workspaceId, targetUserId) {
    const target = memberships.find((m) => m.workspaceId === workspaceId && m.userId === targetUserId);
    if (!target)
        return false;
    if (target.role !== "owner")
        return true;
    return owners(memberships, workspaceId).length > 1;
}
/** Whether a role change is allowed (never demote the last owner). */
function canChangeRole(memberships, workspaceId, targetUserId, newRole) {
    const target = memberships.find((m) => m.workspaceId === workspaceId && m.userId === targetUserId);
    if (!target)
        return false;
    if (target.role === "owner" && roles_1.ROLE_RANK[newRole] < roles_1.ROLE_RANK.owner) {
        return owners(memberships, workspaceId).length > 1; // can't demote the last owner
    }
    return true;
}
