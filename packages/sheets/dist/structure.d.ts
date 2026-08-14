import type { Grid } from "./model";
/** Insert a blank row at 0-based index `at`, shifting lower rows down. */
export declare function insertRow(grid: Grid, at: number): Grid;
/** Delete the row at 0-based index `at`, shifting lower rows up. */
export declare function deleteRow(grid: Grid, at: number): Grid;
/** Insert a blank column at 0-based index `at`, shifting later columns right. */
export declare function insertCol(grid: Grid, at: number): Grid;
/** Delete the column at 0-based index `at`, shifting later columns left. */
export declare function deleteCol(grid: Grid, at: number): Grid;
/**
 * Sort the rows within `range` (e.g. "A1:C10") by the column at 0-based offset
 * `byCol` within the range, writing the reordered cells back into the same
 * cells of the range (a destructive "Sort range", like Google Sheets). When
 * `headerRow` is set the first row of the range stays fixed.
 *
 * The whole row block inside the range moves together (values and formats);
 * formulas inside the range have their references rewritten so they keep
 * pointing at the row they travel with. Pure: returns a new Grid.
 */
export declare function sortRange(grid: Grid, range: string, byCol: number, dir: "asc" | "desc", opts?: {
    headerRow?: boolean;
}): Grid;
