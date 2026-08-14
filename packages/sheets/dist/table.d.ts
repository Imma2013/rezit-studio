import { type CellValue } from "@hc/formula";
import type { Grid, DataTable } from "./model";
/**
 * Apply a data-table view to a grid: read the range, drop the header row if
 * present, apply filters then sort, and return the resulting body rows.
 * Pure: never mutates the grid.
 */
export declare function applyTableView(grid: Grid, table: DataTable, computed?: Record<string, CellValue>): {
    rows: CellValue[][];
};
