export type Scalar = number | string | boolean | null;
export interface FormulaError {
    error: "#DIV/0!" | "#REF!" | "#NAME?" | "#VALUE!" | "#CIRCULAR!" | "#N/A";
}
export type CellValue = Scalar | FormulaError;
export type ArgValue = CellValue | CellValue[][];
export declare function isError(v: unknown): v is FormulaError;
/** Flatten an argument (scalar or matrix) into a 1D list of scalars/errors. */
export declare function flattenArg(arg: ArgValue): CellValue[];
export declare function flattenAll(args: ArgValue[]): CellValue[];
/** First error found in a value, or undefined. */
export declare function findError(v: ArgValue): FormulaError | undefined;
/** Coerce a scalar to a number; returns #VALUE! on failure. */
export declare function toNumber(v: CellValue): number | FormulaError;
export declare function toText(v: CellValue): string;
export declare function toBool(v: CellValue): boolean | FormulaError;
type Fn = (args: ArgValue[], ctx: FnContext) => CellValue;
export interface FnContext {
    now: number;
}
export declare function dateToSerial(year: number, month: number, day: number): number;
export declare const FUNCTIONS: Record<string, Fn>;
export declare function compareValues(a: CellValue, b: CellValue): number;
export {};
