"use strict";
// Scene-tree navigation helpers shared across the editor controller: locate a
// node and its parent/siblings, compute world matrices and axis-aligned bounds,
// and move nodes between sibling arrays. Operates on a plain DesignFile (the
// editable doc); under collaboration the same ops run inside a Yjs txn.
Object.defineProperty(exports, "__esModule", { value: true });
exports.locate = locate;
exports.nodeMap = nodeMap;
exports.worldMatrix = worldMatrix;
exports.worldAABB = worldAABB;
exports.unionAABB = unionAABB;
exports.parentSpaceDelta = parentSpaceDelta;
exports.removeNode = removeNode;
const schema_1 = require("@hc/schema");
const engine_1 = require("@hc/engine");
/** Find a node anywhere in the document, with its parent, siblings, and index. */
function locate(file, id) {
    for (const page of file.pages) {
        const found = locateIn(page.children, id, null, page);
        if (found)
            return found;
    }
    return null;
}
function locateIn(siblings, id, parent, page) {
    for (let i = 0; i < siblings.length; i++) {
        const node = siblings[i];
        if (node.id === id)
            return { node, parent, siblings, index: i, page };
        if ((0, schema_1.isContainer)(node)) {
            const inner = locateIn((0, schema_1.childrenOf)(node), id, node, page);
            if (inner)
                return inner;
        }
    }
    return null;
}
/** Map of every node id to the node, across all pages. */
function nodeMap(file) {
    const m = new Map();
    const walk = (nodes) => {
        for (const n of nodes) {
            m.set(n.id, n);
            if ((0, schema_1.isContainer)(n))
                walk((0, schema_1.childrenOf)(n));
        }
    };
    for (const page of file.pages)
        walk(page.children);
    return m;
}
/** Local->world matrix for a node, composing the chain from the page root. */
function worldMatrix(file, id) {
    for (const page of file.pages) {
        const chain = matrixChain(page.children, id, (0, engine_1.identity)());
        if (chain)
            return chain;
    }
    return null;
}
function matrixChain(siblings, id, parentWorld) {
    for (const node of siblings) {
        const world = (0, engine_1.multiply)(parentWorld, (0, engine_1.fromTransform)(node.transform));
        if (node.id === id)
            return world;
        if ((0, schema_1.isContainer)(node)) {
            const inner = matrixChain((0, schema_1.childrenOf)(node), id, world);
            if (inner)
                return inner;
        }
    }
    return null;
}
/** Axis-aligned page-space bounds of a node (its box under the world matrix). */
function worldAABB(file, id) {
    const loc = locate(file, id);
    const world = worldMatrix(file, id);
    if (!loc || !world)
        return null;
    return (0, engine_1.transformRect)(world, {
        x: 0,
        y: 0,
        width: loc.node.size.width,
        height: loc.node.size.height,
    });
}
/** The page-space AABB enclosing several nodes. */
function unionAABB(file, ids) {
    let out = null;
    for (const id of ids) {
        const b = worldAABB(file, id);
        if (!b)
            continue;
        out = out ? rectUnion(out, b) : b;
    }
    return out;
}
function rectUnion(a, b) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);
    return { x, y, width: right - x, height: bottom - y };
}
/**
 * Convert a page-space drag delta into the node's PARENT space, so move/resize
 * track the cursor even when the node lives inside a rotated/scaled group. For
 * a top-level node the parent is the page (identity), so the delta is returned
 * unchanged.
 */
function parentSpaceDelta(file, id, dx, dy) {
    const world = worldMatrix(file, id);
    const loc = locate(file, id);
    if (!world || !loc)
        return { dx, dy };
    const localInv = (0, engine_1.invert)((0, engine_1.fromTransform)(loc.node.transform));
    if (!localInv)
        return { dx, dy };
    // parentWorld = world * inverse(local); independent of the node's own transform.
    const pw = (0, engine_1.multiply)(world, localInv);
    const det = pw.a * pw.d - pw.b * pw.c;
    if (Math.abs(det) < 1e-12)
        return { dx, dy };
    return {
        dx: (pw.d * dx - pw.c * dy) / det,
        dy: (-pw.b * dx + pw.a * dy) / det,
    };
}
/** Children array a node belongs to is mutated in place by these helpers. */
function removeNode(file, id) {
    const loc = locate(file, id);
    if (!loc)
        return null;
    loc.siblings.splice(loc.index, 1);
    return loc;
}
