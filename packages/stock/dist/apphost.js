"use strict";
// Mini-app scope enforcement. The host grants each app a set
// of capabilities; an action outside the granted scopes is denied and surfaced
// (never a silent failure). Built-in and third-party apps use the same check.
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasScope = hasScope;
exports.checkAppAction = checkAppAction;
exports.assertAppAction = assertAppAction;
exports.canEditNode = canEditNode;
const ACTION_SCOPE = {
    "insert-node": "insert-node",
    "edit-own-nodes": "edit-own-nodes",
    "read-selection": "read-selection",
    network: "network",
};
function hasScope(app, scope) {
    return app.scopes.includes(scope);
}
/** Decide whether an app may perform an action (FR-8). */
function checkAppAction(app, action) {
    const needed = ACTION_SCOPE[action];
    if (hasScope(app, needed))
        return { allowed: true };
    return { allowed: false, reason: `app lacks required scope "${needed}" for action "${action}"` };
}
/** Throw when an app attempts an out-of-scope action (host-side guard). */
function assertAppAction(app, action) {
    const d = checkAppAction(app, action);
    if (!d.allowed)
        throw new Error(d.reason);
}
/**
 * Whether an app may edit a given node: it must hold "edit-own-nodes" and the
 * node must be one the app inserted (tracked by the host via `ownedNodeIds`).
 */
function canEditNode(app, ownedNodeIds, nodeId) {
    return hasScope(app, "edit-own-nodes") && ownedNodeIds.has(nodeId);
}
