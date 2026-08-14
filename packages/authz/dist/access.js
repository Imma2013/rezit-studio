"use strict";
// Per-design access resolution and the capability model (FR-7, FR-8,
// FR-9). This is the security keystone shared by the REST routes and the
// realtime gateway: the single pure place per-design AccessMode and the
// caller's capability set are computed. Pure logic only; grants, links, roles,
// and the approval-lock state are loaded by the backend and passed in.
//
// Resolution rule (FR-7): the effective mode is the HIGHEST of
//   1. the workspace role mapped to a mode (members can edit, viewers can view),
//   2. any explicit per-design grant for the user/email, and
//   3. the mode of a share link the caller entered through,
// then CAPPED by the approval-lock state (FR-11): a locked design downgrades
// every editor to read-only (view or comment, per policy) until reopened.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_BASE_MODE = exports.BUILTIN_ROLE_CAPABILITIES = exports.MODE_RANK = void 0;
exports.resolveDesignAccess = resolveDesignAccess;
exports.hasCapability = hasCapability;
exports.modeCanEdit = modeCanEdit;
exports.isBuiltinRole = isBuiltinRole;
const roles_1 = require("./roles");
/** Higher rank = more access. Used to take the highest of competing sources. */
exports.MODE_RANK = {
    view: 1,
    comment: 2,
    edit: 3,
};
/** The capabilities an AccessMode implies on its own (no role bonus). A `view`
 *  link grants only view; a `comment` link adds comment; `edit` adds edit. */
const MODE_CAPABILITIES = {
    view: ["view"],
    comment: ["view", "comment"],
    edit: ["view", "comment", "edit"],
};
/** Built-in workspace roles mapped to their full capability set (FR-8). Owner
 *  and admin can manage roles and delete; members edit and share; viewers only
 *  view and comment. These seed every workspace and are immutable. */
exports.BUILTIN_ROLE_CAPABILITIES = {
    owner: ["view", "comment", "edit", "share", "approve", "manage-roles", "manage-brand", "delete"],
    admin: ["view", "comment", "edit", "share", "approve", "manage-roles", "manage-brand", "delete"],
    member: ["view", "comment", "edit", "share"],
    viewer: ["view", "comment"],
};
/** The base AccessMode a workspace role confers on a design before grants/links
 *  (FR-7). A viewer's floor is view; members and up can edit. */
exports.ROLE_BASE_MODE = {
    owner: "edit",
    admin: "edit",
    member: "edit",
    viewer: "view",
};
/** The higher of two modes. */
function maxMode(a, b) {
    return exports.MODE_RANK[a] >= exports.MODE_RANK[b] ? a : b;
}
/** Cap a mode so it never exceeds `ceiling`. */
function capMode(mode, ceiling) {
    return exports.MODE_RANK[mode] <= exports.MODE_RANK[ceiling] ? mode : ceiling;
}
/**
 * Resolve a caller's effective per-design access (FR-7). Takes the highest of
 * the workspace-role mode, every explicit grant, and any link mode, then caps
 * it by the approval-lock policy. Returns the resolved mode plus the union of
 * capabilities from the mode, the workspace role, and any custom roles.
 *
 * When NO source grants access (no role, no grant, no link), the caller has no
 * access: capabilities is empty (mode is reported as "view" only as a default
 * label). Callers must gate on `hasCapability(access, "view")`, not on the mode
 * field, to decide whether access exists at all.
 */
function resolveDesignAccess(input) {
    const sources = [];
    if (input.workspaceRole)
        sources.push(exports.ROLE_BASE_MODE[input.workspaceRole]);
    if (input.grants)
        sources.push(...input.grants);
    if (input.link)
        sources.push(input.link);
    // No source means no access at all (e.g. a stranger with no link/grant).
    const hasAccess = sources.length > 0;
    let mode = hasAccess ? sources.reduce(maxMode) : "view";
    // Approval lock caps the mode for everyone (FR-11). The explicit reopen action
    // is handled by the backend clearing the lock before re-resolving, so here we
    // simply honor the cap.
    if (input.approvalLocked) {
        mode = capMode(mode, input.lockPolicy === "view" ? "view" : "comment");
    }
    const caps = new Set();
    if (hasAccess) {
        for (const c of MODE_CAPABILITIES[mode])
            caps.add(c);
        if (input.workspaceRole) {
            // A member/admin/owner keeps their management capabilities even when the
            // mode is bounded (e.g. a viewer floor), EXCEPT edit, which the resolved
            // mode governs (an approval lock must remove edit from an admin too).
            for (const c of exports.BUILTIN_ROLE_CAPABILITIES[input.workspaceRole]) {
                if (c === "edit" && !MODE_CAPABILITIES[mode].includes("edit"))
                    continue;
                caps.add(c);
            }
        }
        if (input.customRoles) {
            for (const r of input.customRoles)
                for (const c of r.capabilities) {
                    if (c === "edit" && !MODE_CAPABILITIES[mode].includes("edit"))
                        continue;
                    caps.add(c);
                }
        }
    }
    return { mode, capabilities: [...caps] };
}
/** True when the resolved access includes a capability. The single gate the
 *  backend capability checks call (FR-8). */
function hasCapability(access, cap) {
    return access.capabilities.includes(cap);
}
/** Whether a mode permits applying document updates over the realtime gateway
 *  (FR-9): only `edit`. Comment/view connect as viewers. */
function modeCanEdit(mode) {
    return mode === "edit";
}
/** True when `role` is one of the four built-in workspace roles. */
function isBuiltinRole(name) {
    return name in roles_1.ROLE_RANK;
}
