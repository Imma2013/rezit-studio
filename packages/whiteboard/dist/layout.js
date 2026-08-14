"use strict";
// Diagram auto-layout (FR-12). Pure and deterministic.
//  - layoutFlowchart: Sugiyama-style layered layout for a directed graph, with
//    longest-path layering, barycenter crossing reduction, and coordinate
//    assignment. Cycles are handled by breaking back-edges for layering.
//  - layoutMindMap: radial BFS layout from a chosen root, sub-dividing angular
//    ranges per subtree so children stay near their parents.
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutFlowchart = layoutFlowchart;
exports.layoutMindMap = layoutMindMap;
/**
 * Layered (Sugiyama-style) layout. Returns a position per node id.
 * The layer axis follows `direction` ("down" => layers stacked vertically,
 * y grows with layer; "right" => layers left-to-right, x grows with layer).
 */
function layoutFlowchart(graph, opts = {}) {
    const layerGap = opts.layerGap ?? 160;
    const nodeGap = opts.nodeGap ?? 140;
    const direction = opts.direction ?? "down";
    const nodes = [...graph.nodes];
    if (nodes.length === 0)
        return {};
    const index = new Map();
    nodes.forEach((n, i) => index.set(n, i));
    // Keep only edges between known, distinct nodes.
    const edges = graph.edges.filter(([u, v]) => index.has(u) && index.has(v) && u !== v);
    // Break cycles: a DFS that drops any edge pointing to a node currently on the
    // recursion stack (a back-edge). Deterministic given node order.
    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map(nodes.map((n) => [n, WHITE]));
    const adj = new Map(nodes.map((n) => [n, []]));
    for (const [u, v] of edges)
        adj.get(u).push(v);
    const acyclic = [];
    const dfs = (u) => {
        color.set(u, GRAY);
        for (const v of adj.get(u)) {
            const c = color.get(v);
            if (c === GRAY) {
                // back-edge: drop for layering.
                continue;
            }
            acyclic.push([u, v]);
            if (c === WHITE)
                dfs(v);
        }
        color.set(u, BLACK);
    };
    for (const n of nodes)
        if (color.get(n) === WHITE)
            dfs(n);
    // Longest-path layering over the acyclic edge set. A node's layer is the max
    // layer of its predecessors + 1; sources land in layer 0.
    const preds = new Map(nodes.map((n) => [n, []]));
    const succ = new Map(nodes.map((n) => [n, []]));
    for (const [u, v] of acyclic) {
        succ.get(u).push(v);
        preds.get(v).push(u);
    }
    const layer = new Map();
    // Topological order via Kahn over the acyclic set.
    const indeg = new Map(nodes.map((n) => [n, preds.get(n).length]));
    const queue = nodes.filter((n) => indeg.get(n) === 0);
    for (const n of queue)
        layer.set(n, 0);
    let qi = 0;
    const order = [];
    while (qi < queue.length) {
        const u = queue[qi++];
        order.push(u);
        const lu = layer.get(u) ?? 0;
        for (const v of succ.get(u)) {
            layer.set(v, Math.max(layer.get(v) ?? 0, lu + 1));
            indeg.set(v, (indeg.get(v) ?? 0) - 1);
            if (indeg.get(v) === 0)
                queue.push(v);
        }
    }
    // Any node not reached (shouldn't happen for acyclic) defaults to layer 0.
    for (const n of nodes)
        if (!layer.has(n))
            layer.set(n, 0);
    // Group nodes by layer, initial order = input order.
    const maxLayer = Math.max(...nodes.map((n) => layer.get(n)));
    const layers = Array.from({ length: maxLayer + 1 }, () => []);
    for (const n of nodes)
        layers[layer.get(n)].push(n);
    // Barycenter crossing reduction: a few down/up sweeps reordering each layer by
    // the average position of its neighbors in the adjacent layer.
    const posInLayer = new Map();
    const recomputePos = () => {
        for (const lyr of layers)
            lyr.forEach((n, i) => posInLayer.set(n, i));
    };
    recomputePos();
    const barycenter = (n, neighbors) => {
        if (neighbors.length === 0)
            return posInLayer.get(n); // keep current
        let sum = 0;
        for (const m of neighbors)
            sum += posInLayer.get(m);
        return sum / neighbors.length;
    };
    for (let sweep = 0; sweep < 4; sweep++) {
        const downward = sweep % 2 === 0;
        if (downward) {
            for (let l = 1; l < layers.length; l++) {
                const lyr = layers[l];
                const key = new Map();
                for (const n of lyr)
                    key.set(n, barycenter(n, preds.get(n)));
                lyr.sort((a, b) => key.get(a) - key.get(b));
                lyr.forEach((n, i) => posInLayer.set(n, i));
            }
        }
        else {
            for (let l = layers.length - 2; l >= 0; l--) {
                const lyr = layers[l];
                const key = new Map();
                for (const n of lyr)
                    key.set(n, barycenter(n, succ.get(n)));
                lyr.sort((a, b) => key.get(a) - key.get(b));
                lyr.forEach((n, i) => posInLayer.set(n, i));
            }
        }
    }
    // Coordinate assignment. Center each layer's row/column around 0.
    const result = {};
    for (let l = 0; l < layers.length; l++) {
        const lyr = layers[l];
        const span = (lyr.length - 1) * nodeGap;
        const start = -span / 2;
        lyr.forEach((n, i) => {
            const along = start + i * nodeGap; // position within the layer
            const across = l * layerGap; // position along the layer axis
            if (direction === "down") {
                result[n] = { x: along, y: across };
            }
            else {
                result[n] = { x: across, y: along };
            }
        });
    }
    return result;
}
/**
 * Radial mind-map layout. BFS levels from `root`; root at origin, each deeper
 * level placed on a circle of radius level*radiusStep. Each node receives an
 * angular slice of its parent's slice, so subtrees stay clustered near parents.
 */
function layoutMindMap(root, graph, opts = {}) {
    const radiusStep = opts.radiusStep ?? 180;
    const nodeSet = new Set(graph.nodes);
    const result = {};
    if (!nodeSet.has(root))
        return result;
    // Undirected adjacency for tree-building (mind maps treat edges as links).
    const adj = new Map();
    for (const n of graph.nodes)
        adj.set(n, []);
    for (const [u, v] of graph.edges) {
        if (!nodeSet.has(u) || !nodeSet.has(v) || u === v)
            continue;
        adj.get(u).push(v);
        adj.get(v).push(u);
    }
    // BFS tree from root; record parent + children, levels.
    const parent = new Map();
    const children = new Map();
    const level = new Map();
    for (const n of graph.nodes)
        children.set(n, []);
    parent.set(root, null);
    level.set(root, 0);
    const order = [root];
    let qi = 0;
    const visited = new Set([root]);
    while (qi < order.length) {
        const u = order[qi++];
        for (const v of adj.get(u)) {
            if (visited.has(v))
                continue;
            visited.add(v);
            parent.set(v, u);
            children.get(u).push(v);
            level.set(v, level.get(u) + 1);
            order.push(v);
        }
    }
    // Count subtree leaves (weight) to share angular space proportionally.
    const weight = new Map();
    // Process in reverse BFS order so children are weighted before parents.
    for (let i = order.length - 1; i >= 0; i--) {
        const n = order[i];
        const kids = children.get(n);
        if (kids.length === 0) {
            weight.set(n, 1);
        }
        else {
            let w = 0;
            for (const k of kids)
                w += weight.get(k);
            weight.set(n, w);
        }
    }
    // Assign angular ranges top-down. Root owns the full circle [0, 2PI).
    const range = new Map();
    range.set(root, [0, Math.PI * 2]);
    result[root] = { x: 0, y: 0 };
    for (const n of order) {
        const [lo, hi] = range.get(n);
        const kids = children.get(n);
        if (kids.length === 0)
            continue;
        // Total weight to distribute across children = sum of child weights.
        let childTotal = 0;
        for (const k of kids)
            childTotal += weight.get(k);
        let cursor = lo;
        const fullSpan = hi - lo;
        for (const k of kids) {
            const frac = weight.get(k) / childTotal;
            const kLo = cursor;
            const kHi = cursor + fullSpan * frac;
            range.set(k, [kLo, kHi]);
            cursor = kHi;
            const angle = (kLo + kHi) / 2;
            const r = level.get(k) * radiusStep;
            result[k] = { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
        }
    }
    return result;
}
