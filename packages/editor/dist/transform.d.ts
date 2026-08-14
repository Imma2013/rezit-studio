import type { Node, Size, Transform } from "@hc/schema";
import { type Mat2D } from "@hc/engine";
export type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
export interface ResizeOpts {
    aspect?: boolean;
    fromCenter?: boolean;
}
export declare function moveTransform(t: Transform, dx: number, dy: number, axisLock?: "x" | "y"): Transform;
/** Rotate by a delta in degrees; snap to 15-degree increments when requested.
 *  Pure transform helper that does NOT adjust translation (rotates about the
 *  local origin). Prefer `rotateAboutCenter` for interactive rotation. */
export declare function rotateTransform(t: Transform, deltaDeg: number, snap?: boolean): Transform;
/** Rotate a node by a delta in degrees about its box center, so it spins in
 *  place. Snap to 15-degree increments when requested. */
export declare function rotateAboutCenter(t: Transform, size: Size, deltaDeg: number, snap?: boolean): Transform;
/** Rotate a node by a delta in degrees about an arbitrary LOCAL pivot, given
 *  as a normalized box fraction (0..1 per axis; {0.5,0.5} is the center), and
 *  recompute the translation so that pivot stays fixed in world space. This is
 *  what makes the "Rotate around" origin picker take effect. Snap to 15-degree
 *  increments when requested. Correct for scaled/flipped/skewed nodes too. */
export declare function rotateAboutPoint(t: Transform, size: Size, deltaDeg: number, origin: {
    x: number;
    y: number;
}, snap?: boolean): Transform;
export declare function setSkew(t: Transform, skewX: number, skewY: number): Transform;
/** Flip horizontally or vertically: negate the scale on that local axis while
 *  keeping the box center fixed. Correct for rotated/skewed nodes too. */
export declare function flipNode(node: Node, axis: "h" | "v"): Transform;
/**
 * Resize a node by dragging `handle` by (dx, dy) in parent space. Returns the
 * new transform and size with the opposite anchor fixed in world space.
 */
export declare function resizeNode(node: Node, handle: HandleId, dx: number, dy: number, opts?: ResizeOpts): {
    transform: Transform;
    size: Size;
};
/**
 * Decompose an affine matrix back to a Transform (translate, rotation, scaleX,
 * scaleY, skewX), used by ungroup to bake a group's transform into its children.
 * The determinant sign is carried on scaleY so reflections round-trip:
 * `fromTransform(decompose(M))` reproduces M for translate/rotate/scale/flip
 * (and a single shear; double-skew is folded in).
 */
export declare function decompose(m: Mat2D): Transform;
