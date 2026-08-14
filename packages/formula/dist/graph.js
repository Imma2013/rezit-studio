"use strict";
// Dependency-graph recomputation over a sparse cell grid.
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRefs = extractRefs;
exports.buildDependencyGraph = buildDependencyGraph;
exports.recompute = recompute;
const parser_1 = require("./parser");
const refs_1 = require("./refs");
const evaluate_1 = require("./evaluate");
const ERR = (code) => ({ error: code });
/**
 * Extract the cell keys a formula depends on. Ranges are expanded into the
 * full list of contained cell keys. Returns canonical (non-absolute) keys.
 */
function extractRefs(formulaSource) {
    let ast;
    try {
        ast = (0, parser_1.parse)(formulaSource);
    }
    catch {
        return [];
    }
    const keys = new Set();
    walk(ast, keys);
    return [...keys];
}
function walk(node, keys) {
    switch (node.kind) {
        case "ref": {
            try {
                const r = (0, refs_1.parseRef)(node.ref);
                keys.add((0, refs_1.cellKey)(r.col, r.row));
            }
            catch {
                /* ignore bad ref */
            }
            break;
        }
        case "range": {
            try {
                const range = (0, refs_1.parseRange)(node.range);
                for (const k of (0, refs_1.rangeKeys)(range))
                    keys.add(k);
            }
            catch {
                /* ignore */
            }
            break;
        }
        case "unary":
            walk(node.operand, keys);
            break;
        case "binary":
            walk(node.left, keys);
            walk(node.right, keys);
            break;
        case "call":
            for (const a of node.args)
                walk(a, keys);
            break;
        default:
            break;
    }
}
/**
 * Build dependency graph from a map of cellKey -> formula source.
 * Only formula cells (those present in the map) are graph nodes; their
 * precedents may be literal cells not present in the map.
 */
function buildDependencyGraph(cells) {
    const dependents = new Map();
    const precedents = new Map();
    for (const [key, formula] of cells) {
        const refs = extractRefs(formula);
        if (!precedents.has(key))
            precedents.set(key, new Set());
        for (const ref of refs) {
            precedents.get(key).add(ref);
            if (!dependents.has(ref))
                dependents.set(ref, new Set());
            dependents.get(ref).add(key);
        }
    }
    return { dependents, precedents };
}
/**
 * Recompute the values of formula cells affected by changedKeys.
 *
 * - `cells`: cellKey -> formula source for every formula cell.
 * - `changedKeys`: keys whose underlying value/formula just changed.
 * - `getLiteral`: resolver for a cell's literal value (non-formula cells, or
 *   the previously-computed value of formula cells not in the dirty set).
 *
 * Returns a map of cellKey -> recomputed CellValue, covering exactly the
 * formula cells in the affected (transitive-dependent) set. Cells that are
 * part of a dependency cycle are marked `#CIRCULAR!`.
 */
function recompute(cells, changedKeys, getLiteral, opts) {
    const graph = buildDependencyGraph(cells);
    // 1. Compute the dirty set: every formula cell transitively dependent on a
    //    changed key, plus changed keys that are themselves formula cells.
    const dirty = new Set();
    const queue = [];
    const enqueue = (k) => {
        if (cells.has(k) && !dirty.has(k)) {
            dirty.add(k);
            queue.push(k);
        }
    };
    for (const k of changedKeys) {
        // a changed literal isn't itself a formula, but its dependents are dirty
        for (const dep of graph.dependents.get(k) ?? [])
            enqueue(dep);
        enqueue(k); // if the changed cell is itself a formula
    }
    while (queue.length) {
        const k = queue.shift();
        for (const dep of graph.dependents.get(k) ?? [])
            enqueue(dep);
    }
    // 2. Topological sort of the dirty set restricted to intra-dirty edges.
    //    Any dirty cell that cannot be ordered is in a cycle.
    const order = [];
    const cyclic = new Set();
    const state = new Map(); // 0 unvisited,1 visiting,2 done
    const visit = (k, stack) => {
        // returns false if a cycle was detected involving k
        const st = state.get(k) ?? 0;
        if (st === 2)
            return true;
        if (st === 1) {
            // back-edge: cycle. Mark the whole current recursion stack.
            return false;
        }
        state.set(k, 1);
        stack.add(k);
        let ok = true;
        for (const pre of graph.precedents.get(k) ?? []) {
            if (!dirty.has(pre))
                continue; // literal/clean precedent: not in this DAG
            if (!visit(pre, stack)) {
                ok = false;
                // mark everything currently on the stack as cyclic
                for (const s of stack)
                    cyclic.add(s);
            }
        }
        stack.delete(k);
        state.set(k, 2);
        if (ok && !cyclic.has(k))
            order.push(k);
        return ok && !cyclic.has(k);
    };
    for (const k of dirty) {
        if ((state.get(k) ?? 0) === 0)
            visit(k, new Set());
    }
    // Mark any node reachable from a cyclic node (within dirty) as poisoned too:
    // a cell that depends on a circular cell cannot produce a value.
    const poisoned = new Set(cyclic);
    let changed = true;
    while (changed) {
        changed = false;
        for (const k of dirty) {
            if (poisoned.has(k))
                continue;
            for (const pre of graph.precedents.get(k) ?? []) {
                if (poisoned.has(pre)) {
                    poisoned.add(k);
                    changed = true;
                    break;
                }
            }
        }
    }
    // 3. Evaluate in topological order. A resolver that reads already-computed
    //    dirty results first, then falls back to the literal resolver.
    const results = new Map();
    for (const k of poisoned)
        results.set(k, ERR("#CIRCULAR!"));
    const resolve = (col, row) => {
        const key = (0, refs_1.cellKey)(col, row);
        if (results.has(key))
            return results.get(key);
        return getLiteral(col, row);
    };
    for (const key of order) {
        if (poisoned.has(key))
            continue;
        const formula = cells.get(key);
        const value = (0, evaluate_1.evaluate)(formula, { getCell: resolve, now: opts?.now });
        results.set(key, value);
    }
    // Ensure every dirty formula cell has an entry (poisoned ones already set).
    for (const k of dirty) {
        if (!results.has(k))
            results.set(k, ERR("#CIRCULAR!"));
    }
    return results;
}
