import { CellValue } from "./functions";
export interface EvalContext {
    /** Resolve a single cell's current value. col/row are 0-based. */
    getCell(col: number, row: number): CellValue;
    /** Injectable clock for TODAY/NOW. Defaults to Date.now(). */
    now?: number;
}
/** Parse and evaluate a formula source (with or without leading "="). */
export declare function evaluate(formulaSource: string, ctx: EvalContext): CellValue;
