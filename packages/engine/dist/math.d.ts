import type { Transform } from "@hc/schema";
/**
 * A 2D affine matrix mapping a local point (x, y) to
 * (a*x + c*y + e, b*x + d*y + f) - the same component order as the Canvas2D
 * `setTransform(a, b, c, d, e, f)` API.
 */
export interface Mat2D {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}
export interface Point {
    x: number;
    y: number;
}
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function identity(): Mat2D;
/** `m * n` - the matrix that applies `n` first, then `m`. */
export declare function multiply(m: Mat2D, n: Mat2D): Mat2D;
/**
 * Build the local-to-parent matrix for a node `Transform`. Composition is
 * translate -> rotate -> skew -> scale, all about the node's local origin
 * (0, 0) - i.e. a local point is scaled, skewed, rotated, then translated.
 * Rotation is clockwise in degrees.
 */
export declare function fromTransform(t: Transform): Mat2D;
/** Decompose an affine matrix back into a translate/rotate/scale Transform (the
 *  inverse of {@link fromTransform} for skew-free matrices; shear is folded into
 *  scale/rotation, so it is approximate when a skew is present). Used to bake a
 *  composed parent transform (e.g. flattened SVG groups) into a node. */
export declare function decompose(m: Mat2D): Transform;
/** Invert an affine matrix, or return null if it is singular (det ~ 0). */
export declare function invert(m: Mat2D): Mat2D | null;
export declare function applyToPoint(m: Mat2D, p: Point): Point;
export declare function matToArray(m: Mat2D): Float32Array;
export declare function rectFromPoints(points: Point[]): Rect;
/** Axis-aligned bounds of a rect after an affine transform (its 4 corners). */
export declare function transformRect(m: Mat2D, r: Rect): Rect;
export declare function rectUnion(a: Rect, b: Rect): Rect;
export declare function rectIntersects(a: Rect, b: Rect): boolean;
export declare function rectIntersection(a: Rect, b: Rect): Rect | null;
export declare function rectContainsPoint(r: Rect, p: Point): boolean;
/** True when `outer` fully contains `inner`. */
export declare function rectContainsRect(outer: Rect, inner: Rect): boolean;
/** Grow a rect outward by `amount` on every side (clamped to >= 0 amount). */
export declare function rectInflate(r: Rect, amount: number): Rect;
