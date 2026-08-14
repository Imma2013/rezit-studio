"use strict";
// Data tables: read a range, apply filters then sort, return 2D rows.
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTableView = applyTableView;
const formula_1 = require("@hc/formula");
/**
 * Read the effective value of a cell in the grid, preferring a computed
 * formula result over the stored literal.
 */
function cellValueAt(grid, col, row, computed) {
    const key = (0, formula_1.cellKey)(col, row);
    if (key in computed)
        return computed[key];
    const cell = grid.cells[key];
    if (cell === undefined)
        return null;
    if (typeof cell.f === "string" && cell.f.startsWith("=")) {
        return cell.v ?? null;
    }
    return cell.v ?? null;
}
/** Read the table's range into a dense 2D matrix of values (row-major). */
function readRange(grid, range, computed) {
    const r = (0, formula_1.parseRange)(range);
    const rows = [];
    for (let row = r.start.row; row <= r.end.row; row++) {
        const out = [];
        for (let col = r.start.col; col <= r.end.col; col++) {
            out.push(cellValueAt(grid, col, row, computed));
        }
        rows.push(out);
    }
    return rows;
}
function toNum(v) {
    if (typeof v === "number")
        return v;
    if (typeof v === "boolean")
        return v ? 1 : 0;
    if (typeof v === "string") {
        const n = Number(v);
        return Number.isNaN(n) ? NaN : n;
    }
    return NaN;
}
function compare(a, b) {
    if ((0, formula_1.isError)(a) || (0, formula_1.isError)(b))
        return 0;
    const an = toNum(a);
    const bn = toNum(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) {
        return an < bn ? -1 : an > bn ? 1 : 0;
    }
    const as = a === null ? "" : String(a);
    const bs = b === null ? "" : String(b);
    return as < bs ? -1 : as > bs ? 1 : 0;
}
function filterMatch(value, op, target) {
    switch (op) {
        case "eq":
        case "=":
            if (typeof target === "number" || typeof value === "number") {
                return toNum(value) === toNum(target);
            }
            return String(value ?? "") === String(target ?? "");
        case "neq":
        case "<>":
            return String(value ?? "") !== String(target ?? "");
        case "gt":
        case ">":
            return toNum(value) > toNum(target);
        case "gte":
        case ">=":
            return toNum(value) >= toNum(target);
        case "lt":
        case "<":
            return toNum(value) < toNum(target);
        case "lte":
        case "<=":
            return toNum(value) <= toNum(target);
        case "contains":
            return String(value ?? "")
                .toLowerCase()
                .includes(String(target ?? "").toLowerCase());
        default:
            return true;
    }
}
/**
 * Apply a data-table view to a grid: read the range, drop the header row if
 * present, apply filters then sort, and return the resulting body rows.
 * Pure: never mutates the grid.
 */
function applyTableView(grid, table, computed = {}) {
    const all = readRange(grid, table.range, computed);
    let body = table.headerRow ? all.slice(1) : all.slice();
    if (table.filters && table.filters.length) {
        for (const f of table.filters) {
            body = body.filter((row) => filterMatch(row[f.col], f.op, f.value));
        }
    }
    if (table.sort) {
        const { col, dir } = table.sort;
        const factor = dir === "desc" ? -1 : 1;
        body = body
            .map((row, i) => ({ row, i }))
            .sort((x, y) => {
            const c = compare(x.row[col], y.row[col]);
            return c !== 0 ? c * factor : x.i - y.i; // stable
        })
            .map((e) => e.row);
    }
    return { rows: body };
}
