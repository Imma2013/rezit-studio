import type { VectorPath } from "@hc/schema";
import type { Point, Rect } from "./types";
/** Axis-aligned bounds of a path (flattened). */
export declare function bounds(path: VectorPath): Rect;
/** True if a point is inside the path under the given fill rule. */
export declare function pointInPath(path: VectorPath, p: Point, rule?: VectorPath["fillRule"]): boolean;
