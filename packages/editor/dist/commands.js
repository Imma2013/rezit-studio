"use strict";
// Reversible edit commands. Every gesture emits one
// command; the global undo stack and keybindings live in the clipboard/shortcuts
// layer. Here we define
// the command data, their inverse, and how to apply them to the editable doc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.invertCommand = invertCommand;
exports.applyCommand = applyCommand;
exports.applyGroup = applyGroup;
exports.applyUngroup = applyUngroup;
const schema_1 = require("@hc/schema");
const engine_1 = require("@hc/engine");
const transform_1 = require("./transform");
const tree_1 = require("./tree");
/** The inverse command, such that applying a command then its inverse is a no-op. */
function invertCommand(cmd) {
    switch (cmd.kind) {
        case "transform":
            return {
                ...cmd,
                before: cmd.after,
                after: cmd.before,
                beforeSizes: cmd.afterSizes,
                afterSizes: cmd.beforeSizes,
            };
        case "reorder":
            return { ...cmd, fromIndex: cmd.toIndex, toIndex: cmd.fromIndex };
        case "reparent":
            return {
                ...cmd,
                fromParent: cmd.toParent,
                toParent: cmd.fromParent,
                fromIndex: cmd.toIndex,
                toIndex: cmd.fromIndex,
                beforeTransform: cmd.afterTransform,
                afterTransform: cmd.beforeTransform,
            };
        case "group":
            return { kind: "ungroup", groupId: cmd.groupId, members: cmd.members, parent: cmd.parent };
        case "ungroup":
            return { kind: "group", groupId: cmd.groupId, members: cmd.members, parent: cmd.parent };
        case "setFlag":
            return { ...cmd, before: cmd.after, after: cmd.before };
        case "setOpacity":
            return { ...cmd, before: cmd.after, after: cmd.before };
        case "setBlend":
            return { ...cmd, before: cmd.after, after: cmd.before };
        case "setFills":
            return { ...cmd, before: cmd.after, after: cmd.before };
        case "setStroke":
            return { ...cmd, before: cmd.after, after: cmd.before };
        case "setEffects":
            return { ...cmd, before: cmd.after, after: cmd.before };
        case "insert":
            return { kind: "remove", parent: cmd.parent, index: cmd.index, node: cmd.node };
        case "remove":
            return { kind: "insert", parent: cmd.parent, index: cmd.index, node: cmd.node };
        case "rename":
            return { ...cmd, before: cmd.after, after: cmd.before };
    }
}
function siblingsForParent(file, parent) {
    if (parent === "page")
        return file.pages[0].children;
    const loc = (0, tree_1.locate)(file, parent);
    return loc && (0, schema_1.isContainer)(loc.node) ? (0, schema_1.childrenOf)(loc.node) : null;
}
function parentSpaceAABB(node) {
    return (0, engine_1.transformRect)((0, engine_1.fromTransform)(node.transform), {
        x: 0,
        y: 0,
        width: node.size.width,
        height: node.size.height,
    });
}
/** Apply a command to the editable document, mutating it in place. */
function applyCommand(file, cmd) {
    switch (cmd.kind) {
        case "transform": {
            cmd.nodes.forEach((id, i) => {
                const loc = (0, tree_1.locate)(file, id);
                if (!loc)
                    return;
                loc.node.transform = cmd.after[i];
                if (cmd.afterSizes?.[i])
                    loc.node.size = cmd.afterSizes[i];
            });
            return;
        }
        case "setFlag": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (loc)
                loc.node[cmd.flag] = cmd.after;
            return;
        }
        case "setOpacity": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (loc)
                loc.node.opacity = cmd.after;
            return;
        }
        case "setBlend": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (loc)
                loc.node.blendMode = cmd.after;
            return;
        }
        case "setFills": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (!loc)
                return;
            const node = loc.node;
            if (cmd.after === undefined)
                delete node.fills;
            else
                node.fills = cmd.after;
            return;
        }
        case "setStroke": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (!loc)
                return;
            const node = loc.node;
            if (cmd.after === undefined)
                delete node.stroke;
            else
                node.stroke = cmd.after;
            return;
        }
        case "setEffects": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (!loc)
                return;
            const node = loc.node;
            if (cmd.after === undefined)
                delete node.effects;
            else
                node.effects = cmd.after;
            return;
        }
        case "insert": {
            const siblings = siblingsForParent(file, cmd.parent);
            if (!siblings)
                return;
            const at = Math.max(0, Math.min(cmd.index, siblings.length));
            siblings.splice(at, 0, cmd.node);
            return;
        }
        case "remove": {
            const siblings = siblingsForParent(file, cmd.parent);
            if (!siblings)
                return;
            const at = siblings.findIndex((n) => n.id === cmd.node.id);
            if (at >= 0)
                siblings.splice(at, 1);
            return;
        }
        case "rename": {
            const loc = (0, tree_1.locate)(file, cmd.node);
            if (loc)
                loc.node.name = cmd.after;
            return;
        }
        case "reorder": {
            const siblings = siblingsForParent(file, cmd.parent);
            if (!siblings)
                return;
            const from = siblings.findIndex((n) => n.id === cmd.node);
            if (from < 0)
                return;
            const [node] = siblings.splice(from, 1);
            const to = Math.max(0, Math.min(cmd.toIndex, siblings.length));
            siblings.splice(to, 0, node);
            return;
        }
        case "reparent": {
            const loc = (0, tree_1.removeNode)(file, cmd.node);
            if (!loc)
                return;
            loc.node.transform = cmd.afterTransform;
            const target = siblingsForParent(file, cmd.toParent);
            if (!target)
                return;
            // Insert at the recorded index so z-order is preserved (and restored on
            // undo) instead of always appending to the end.
            const at = Math.max(0, Math.min(cmd.toIndex, target.length));
            target.splice(at, 0, loc.node);
            return;
        }
        case "group":
            applyGroup(file, cmd.groupId, cmd.members, cmd.parent);
            return;
        case "ungroup":
            applyUngroup(file, cmd.groupId);
            return;
    }
}
/** Collect members under a new identity-positioned group; visuals are preserved
 *  because the group is a pure translation to the members' bounding origin. */
function applyGroup(file, groupId, members, parent) {
    const siblings = siblingsForParent(file, parent);
    if (!siblings)
        return null;
    const memberSet = new Set(members);
    // Union AABB of members in parent space; the group origin sits there.
    let union = null;
    for (const n of siblings) {
        if (!memberSet.has(n.id))
            continue;
        const b = parentSpaceAABB(n);
        union = union ? rectUnion(union, b) : b;
    }
    if (!union)
        return null;
    const insertAt = siblings.findIndex((n) => memberSet.has(n.id));
    const children = [];
    for (let i = siblings.length - 1; i >= 0; i--) {
        if (memberSet.has(siblings[i].id)) {
            const [child] = siblings.splice(i, 1);
            // Offset child into group-local space (group is translate-only, identity scale/rot).
            child.transform = {
                ...child.transform,
                x: child.transform.x - union.x,
                y: child.transform.y - union.y,
            };
            children.unshift(child);
        }
    }
    const group = {
        id: groupId,
        type: "group",
        transform: { x: union.x, y: union.y, scaleX: 1, scaleY: 1, rotation: 0 },
        size: { width: union.width, height: union.height },
        opacity: 1,
        blendMode: "normal",
        aspectLocked: true,
        children,
    };
    siblings.splice(Math.max(0, insertAt), 0, group);
    return group;
}
/** Dissolve a group, baking its transform into each child to preserve visuals. */
function applyUngroup(file, groupId) {
    const loc = (0, tree_1.locate)(file, groupId);
    if (!loc || loc.node.type !== "group")
        return [];
    const group = loc.node;
    const groupMatrix = (0, engine_1.fromTransform)(group.transform);
    const restored = group.children.map((child) => {
        const childWorld = (0, engine_1.multiply)(groupMatrix, (0, engine_1.fromTransform)(child.transform));
        return { ...child, transform: { ...(0, transform_1.decompose)(childWorld) } };
    });
    loc.siblings.splice(loc.index, 1, ...restored);
    return restored.map((n) => n.id);
}
function rectUnion(a, b) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);
    return { x, y, width: right - x, height: bottom - y };
}
