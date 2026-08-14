"use strict";
// Bridge the sheet cell model to @hc/formula's dependency-graph recompute.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = void 0;
exports.recomputeGrid = recomputeGrid;
exports.recomputeChanged = recomputeChanged;
const formula_1 = require("@hc/formula");
Object.defineProperty(exports, "isError", { enumerable: true, get: function () { return formula_1.isError; } });
/** A cell is a formula cell when its `f` source begins with "=". */
function isFormulaCell(cell) {
    return typeof cell.f === "string" && cell.f.startsWith("=");
}
/** Read a cell's literal value (used for non-formula precedents). */
function literalAt(grid, col, row) {
    const cell = grid.cells[(0, formula_1.cellKey)(col, row)];
    if (cell === undefined)
        return null;
    if (isFormulaCell(cell)) {
        // a formula cell's literal fallback is its stored `v` (last computed),
        // but during recompute the graph supplies the fresh value; this only
        // applies to formula cells outside the dirty set.
        return cell.v ?? null;
    }
    return cell.v ?? null;
}
/**
 * Recompute every formula cell in the grid. Returns a map of
 * cellKey -> computed CellValue covering all formula cells.
 *
 * This performs a full recompute (all formula cells are considered changed),
 * which is the correct behavior for an initial load or a snapshot restore.
 */
function recomputeGrid(grid, opts) {
    const formulas = new Map();
    const changed = [];
    for (const [key, cell] of Object.entries(grid.cells)) {
        if (isFormulaCell(cell)) {
            formulas.set(key, cell.f);
            changed.push(key);
        }
    }
    if (formulas.size === 0)
        return {};
    const computed = (0, formula_1.recompute)(formulas, changed, (col, row) => literalAt(grid, col, row), { now: opts?.now });
    const out = {};
    for (const [key, value] of computed)
        out[key] = value;
    return out;
}
/**
 * Incremental recompute: given the keys that just changed, return only the
 * affected formula cells' new values.
 */
function recomputeChanged(grid, changedKeys, opts) {
    const formulas = new Map();
    for (const [key, cell] of Object.entries(grid.cells)) {
        if (isFormulaCell(cell))
            formulas.set(key, cell.f);
    }
    const computed = (0, formula_1.recompute)(formulas, changedKeys, (col, row) => literalAt(grid, col, row), { now: opts?.now });
    const out = {};
    for (const [key, value] of computed)
        out[key] = value;
    return out;
}
