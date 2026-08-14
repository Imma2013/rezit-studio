"use strict";
// Generic scene-graph traversal shared by validate, the renderer,
// hit-testing, bounds, and serialization, so tree-walk logic lives in one place
//.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContainer = isContainer;
exports.childrenOf = childrenOf;
exports.nestedSlotsOf = nestedSlotsOf;
exports.childNodesOf = childNodesOf;
exports.walkNodes = walkNodes;
exports.collectIds = collectIds;
exports.maxDepth = maxDepth;
/** A container node carries an ordered `children: Node[]` (FR-4). */
function isContainer(node) {
    return node.type === "group" || node.type === "frame" || node.type === "grid";
}
/** Children of a node, or an empty array for leaf nodes.
 *
 *  This is specifically the `children` ARRAY accessor. For "every node nested
 *  below this one, wherever it is stored", use `childNodesOf`. */
function childrenOf(node) {
    return isContainer(node) ? node.children : [];
}
/**
 * Every node nested below this one, INCLUDING the ones stored outside
 * `children`.
 *
 * A mask keeps its single subject in `child` and a boolean keeps its inputs in
 * `operands`, so a walker that only ever reads `children` cannot see them. That
 * is not a cosmetic gap: it made a masked node invisible to id-uniqueness
 * validation, to comment anchoring, to version diffs, and to the scene build
 * itself, which is why masks did not render at all.
 *
 * The backend's write boundary (`persistence/validate.go`) already descends
 * into both slots, so ids nested there have always shared the one global
 * namespace. This makes the client agree with the server rather than widening
 * anything.
 */
function nestedSlotsOf(node) {
    const slots = [];
    if (isContainer(node)) {
        slots.push({ key: "children", nodes: node.children ?? [], indexed: true });
    }
    // Type-gated, matching the Go boundary: a forward-compatible node that
    // happens to carry a `child` or `operands` field with a different meaning
    // must not be walked as if it held nodes.
    if (node.type === "mask") {
        const child = node.child;
        if (child)
            slots.push({ key: "child", nodes: [child], indexed: false });
    }
    if (node.type === "boolean") {
        const operands = node.operands;
        if (operands && operands.length > 0)
            slots.push({ key: "operands", nodes: operands, indexed: true });
    }
    return slots;
}
/** Every nested node, flattened. Order is `children`, then `child`/`operands`. */
function childNodesOf(node) {
    const out = [];
    for (const slot of nestedSlotsOf(node))
        out.push(...slot.nodes);
    return out;
}
/**
 * Depth-first, pre-order walk over a list of nodes (a page's `children`).
 * `basePath` is prepended to every reported path so callers can anchor the
 * pointer at, for example, `["pages", 0, "children"]`.
 */
function walkNodes(nodes, visit, basePath = []) {
    // Recurses over a single NODE rather than a list, because the two slot shapes
    // produce different pointers: `children` and `operands` are arrays and take
    // an index, while a mask's `child` is one node and its pointer ends at the
    // key. A list-shaped recursion has to special-case the single-node slot at
    // every level, and gets it wrong the moment a mask contains a mask.
    const visitNode = (node, path, depth, parent) => {
        visit(node, { path, depth, parent });
        for (const slot of nestedSlotsOf(node)) {
            const slotPath = [...path, slot.key];
            if (slot.indexed) {
                slot.nodes.forEach((child, i) => visitNode(child, [...slotPath, i], depth + 1, node));
            }
            else {
                visitNode(slot.nodes[0], slotPath, depth + 1, node);
            }
        }
    };
    nodes.forEach((node, index) => visitNode(node, [...basePath, index], 0, null));
}
/** Collect every node id in document order. */
function collectIds(nodes) {
    const ids = [];
    walkNodes(nodes, (node) => ids.push(node.id));
    return ids;
}
/** The deepest container nesting level present (0 for a flat list). */
function maxDepth(nodes) {
    let max = 0;
    walkNodes(nodes, (_node, info) => {
        if (info.depth > max)
            max = info.depth;
    });
    return max;
}
