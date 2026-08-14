/**
 * Evaluate a numeric field. Returns null if the input is not a valid expression
 * (callers keep the prior value). `current` anchors relative expressions.
 */
export declare function evalExpression(input: string, current?: number): number | null;
