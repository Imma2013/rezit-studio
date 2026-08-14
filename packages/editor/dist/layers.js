"use strict";
// Per-node layer state: lock, hide, isolate, opacity, blend, rename (FR-22..FR-24).
// Each mutating op returns the reversible EditCommand it performed (or null if
// the node was not found) so the caller can push it to the undo stack.
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocked = setLocked;
exports.setHidden = setHidden;
exports.setOpacity = setOpacity;
exports.setBlend = setBlend;
exports.rename = rename;
exports.isolationHiddenSiblings = isolationHiddenSiblings;
const tree_1 = require("./tree");
function setLocked(file, id, value) {
    const loc = (0, tree_1.locate)(file, id);
    if (!loc)
        return null;
    const before = !!loc.node.locked;
    loc.node.locked = value;
    return { kind: "setFlag", node: id, flag: "locked", before, after: value };
}
function setHidden(file, id, value) {
    const loc = (0, tree_1.locate)(file, id);
    if (!loc)
        return null;
    const before = !!loc.node.hidden;
    loc.node.hidden = value;
    return { kind: "setFlag", node: id, flag: "hidden", before, after: value };
}
function setOpacity(file, id, value) {
    const loc = (0, tree_1.locate)(file, id);
    if (!loc)
        return null;
    const before = loc.node.opacity;
    const after = Math.max(0, Math.min(1, value));
    loc.node.opacity = after;
    return { kind: "setOpacity", node: id, before, after };
}
function setBlend(file, id, mode) {
    const loc = (0, tree_1.locate)(file, id);
    if (!loc)
        return null;
    const before = loc.node.blendMode;
    loc.node.blendMode = mode;
    return { kind: "setBlend", node: id, before, after: mode };
}
function rename(file, id, name) {
    const loc = (0, tree_1.locate)(file, id);
    if (!loc)
        return null;
    const before = loc.node.name;
    loc.node.name = name;
    return { kind: "rename", node: id, before, after: name };
}
/**
 * Isolate (solo): the sibling node ids that should be hidden so only `id` (and
 * its subtree) is visible. Returns [] when `id` is null (isolation cleared).
 * Isolation is a transient editor concern, so this computes the set rather than
 * mutating persisted `hidden` flags (FR-23).
 */
function isolationHiddenSiblings(file, id) {
    if (!id)
        return [];
    const loc = (0, tree_1.locate)(file, id);
    if (!loc)
        return [];
    return loc.siblings.filter((n) => n.id !== id).map((n) => n.id);
}
