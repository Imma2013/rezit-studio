import { type CellValue, type FormulaError, isError } from "@hc/formula";
import type { Grid } from "./model";
export type { CellValue, FormulaError };
export { isError };
/**
 * Recompute every formula cell in the grid. Returns a map of
 * cellKey -> computed CellValue covering all formula cells.
 *
 * This performs a full recompute (all formula cells are considered changed),
 * which is the correct behavior for an initial load or a snapshot restore.
 */
export declare function recomputeGrid(grid: Grid, opts?: {
    now?: number;
}): Record<string, CellValue>;
/**
 * Incremental recompute: given the keys that just changed, return only the
 * affected formula cells' new values.
 */
export declare function recomputeChanged(grid: Grid, changedKeys: string[], opts?: {
    now?: number;
}): Record<string, CellValue>;
