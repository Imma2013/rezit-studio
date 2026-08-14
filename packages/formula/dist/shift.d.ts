export interface ShiftOpts {
    axis: "row" | "col";
    /** 0-based index at which the row/col is inserted or deleted. */
    at: number;
    /** +1 for an insert, -1 for a delete. */
    delta: number;
}
/**
 * Rewrite every A1 cell/range reference in a formula source string for a
 * structural edit. The leading "=" (if any) is preserved. Non-reference tokens
 * (numbers, strings, function names, operators) pass through unchanged, so a
 * name like LOG10 or a quoted "A1" string is never mangled.
 *
 * On a delete (delta < 0) a reference that names exactly the removed row/col,
 * and a range with such an endpoint, is replaced with the literal "#REF!".
 */
export declare function shiftRefs(formula: string, opts: ShiftOpts): string;
