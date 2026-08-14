"use strict";
// Sheet cell model. A sheet lives in a Design's `meta.kind === "sheet"`.
// Cells are NOT scene nodes; they are stored sparsely on the grid keyed "A1".
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCell = getCell;
exports.setCell = setCell;
exports.cellDisplayValue = cellDisplayValue;
exports.createGrid = createGrid;
/** Read a cell by A1 key. Returns undefined when the cell is empty. */
function getCell(grid, key) {
    return grid.cells[key];
}
/**
 * Immutable cell update: returns a new Grid with the cell at `key` set.
 * Passing `undefined` clears the cell.
 */
function setCell(grid, key, cell) {
    const cells = { ...grid.cells };
    if (cell === undefined) {
        delete cells[key];
    }
    else {
        cells[key] = cell;
    }
    return { ...grid, cells };
}
/**
 * The value a cell should display: a computed formula result when available,
 * otherwise the cell's literal value. Errors render as their code string.
 */
function cellDisplayValue(cell, computed) {
    if (cell === undefined)
        return null;
    if (cell.f !== undefined && cell.f.startsWith("=")) {
        return computed ?? null;
    }
    return cell.v ?? null;
}
/** Create an empty grid. */
function createGrid(id, name, rows = 100, cols = 26) {
    return { id, name, rows, cols, cells: {} };
}
