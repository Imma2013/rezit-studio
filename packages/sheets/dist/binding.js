"use strict";
// Chart binding resolver: shape a grid range into chart-ready series.
// This feeds an existing `chart` scene node (F27).
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBinding = resolveBinding;
const formula_1 = require("@hc/formula");
function cellValueAt(grid, col, row, computed) {
    const key = (0, formula_1.cellKey)(col, row);
    if (key in computed)
        return computed[key];
    const cell = grid.cells[key];
    if (cell === undefined)
        return null;
    return cell.v ?? null;
}
function toLabel(v) {
    if (v === null)
        return "";
    if (typeof v === "object")
        return v.error;
    if (typeof v === "boolean")
        return v ? "TRUE" : "FALSE";
    return String(v);
}
function toValue(v) {
    if (typeof v === "number")
        return v;
    if (typeof v === "boolean")
        return v ? 1 : 0;
    if (typeof v === "string") {
        const n = Number(v);
        return Number.isNaN(n) ? 0 : n;
    }
    return 0;
}
/**
 * Resolve a ChartBinding into chart-ready data.
 *
 * orientation "columns": each column is a series; the first row holds series
 * names and the first column holds category labels.
 * orientation "rows": each row is a series; the first column holds series
 * names and the first row holds category labels.
 */
function resolveBinding(grid, binding, computed = {}) {
    const r = (0, formula_1.parseRange)(binding.range);
    const nRows = r.end.row - r.start.row + 1;
    const nCols = r.end.col - r.start.col + 1;
    // dense matrix of the range
    const matrix = [];
    for (let row = 0; row < nRows; row++) {
        const out = [];
        for (let col = 0; col < nCols; col++) {
            out.push(cellValueAt(grid, r.start.col + col, r.start.row + row, computed));
        }
        matrix.push(out);
    }
    if (nRows === 0 || nCols === 0) {
        return { categories: [], series: [] };
    }
    if (binding.orientation === "columns") {
        // categories from first column (rows 1..), series names from first row (cols 1..)
        const categories = [];
        for (let row = 1; row < nRows; row++) {
            categories.push(toLabel(matrix[row][0]));
        }
        const series = [];
        for (let col = 1; col < nCols; col++) {
            const name = toLabel(matrix[0][col]);
            const values = [];
            for (let row = 1; row < nRows; row++) {
                values.push(toValue(matrix[row][col]));
            }
            series.push({ name, values });
        }
        return { categories, series };
    }
    // orientation "rows": categories from first row (cols 1..), series names from
    // first column (rows 1..)
    const categories = [];
    for (let col = 1; col < nCols; col++) {
        categories.push(toLabel(matrix[0][col]));
    }
    const series = [];
    for (let row = 1; row < nRows; row++) {
        const name = toLabel(matrix[row][0]);
        const values = [];
        for (let col = 1; col < nCols; col++) {
            values.push(toValue(matrix[row][col]));
        }
        series.push({ name, values });
    }
    return { categories, series };
}
