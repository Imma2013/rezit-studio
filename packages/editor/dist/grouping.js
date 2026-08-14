"use strict";
// Grouping (FR-20, FR-21). group() collects selected siblings under a new
// GroupNode preserving world transforms; ungroup() dissolves a group, baking its
// transform back into the children. Both return the reversible EditCommand.
Object.defineProperty(exports, "__esModule", { value: true });
exports.group = group;
exports.ungroup = ungroup;
const commands_1 = require("./commands");
const tree_1 = require("./tree");
function newId() {
    return globalThis.crypto.randomUUID();
}
function parentRefOf(file, id) {
    const loc = (0, tree_1.locate)(file, id);
    return loc && loc.parent ? loc.parent.id : "page";
}
/** Group selected nodes; returns the new group id and the command performed. */
function group(file, ids, groupId = newId()) {
    if (ids.length === 0)
        return null;
    const parent = parentRefOf(file, ids[0]);
    const created = (0, commands_1.applyGroup)(file, groupId, ids, parent);
    if (!created)
        return null;
    return { groupId, command: { kind: "group", groupId, members: ids, parent } };
}
/** Ungroup a group; returns the freed child ids and the command performed. */
function ungroup(file, groupId) {
    const loc = (0, tree_1.locate)(file, groupId);
    if (!loc || loc.node.type !== "group")
        return null;
    const parent = loc.parent ? loc.parent.id : "page";
    const members = (0, commands_1.applyUngroup)(file, groupId);
    return { members, command: { kind: "ungroup", groupId, members, parent } };
}
