import type { VectorPath } from "@hc/schema";
export type BooleanOp = "union" | "subtract" | "intersect" | "exclude";
export declare function booleanOp(op: BooleanOp, paths: VectorPath[]): VectorPath;
