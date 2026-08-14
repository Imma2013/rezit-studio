import type { Rect } from "@hc/engine";
export interface SnapOptions {
    /** Snap distance in page units (screen px / zoom). Default 6. */
    threshold?: number;
    /** Page box, for snapping to page edges/center. */
    pageRect?: Rect;
    /** Grid step in page units, for grid snapping. */
    grid?: number;
}
export interface SnapResult {
    dx: number;
    dy: number;
    /** Page-space x positions of matched vertical guides. */
    guidesX: number[];
    /** Page-space y positions of matched horizontal guides. */
    guidesY: number[];
}
/** Compute the snap offset (dx, dy) and matched guide lines for a moving box. */
export declare function snap(moving: Rect, statics: Rect[], opts?: SnapOptions): SnapResult;
/** One gap region to draw as a spacing indicator, in page units. */
export interface SpacingSegment {
    /** Start coordinate of the empty gap along the snap axis. */
    from: number;
    /** End coordinate of the empty gap along the snap axis. */
    to: number;
    /** Cross-axis coordinate at which to draw the spacing bar. */
    cross: number;
}
/** A matched equal-spacing snap: the common gap plus the regions to render. */
export interface SpacingGuide {
    axis: "x" | "y";
    /** The equal gap size in page units. */
    gap: number;
    /** Gap regions to render (the moving-side gap plus its reference gap). */
    segments: SpacingSegment[];
}
export interface SpacingSnapResult {
    /** Snap offset along the axis in page units; 0 when nothing matched. */
    delta: number;
    guide: SpacingGuide | null;
}
/**
 * Equal-spacing (distribution) snap for a moving box against static neighbors
 * along one axis (the equal-spacing guides). Only boxes that share a band
 * on the cross axis count as in-line neighbors. Two behaviors are considered and
 * the smaller correction wins:
 *
 *   A. Center between the nearest left and right neighbor so both gaps are equal.
 *   B. Match an adjacent pair's gap so the box extends an evenly spaced chain
 *      (gap to the near neighbor equals that neighbor's gap to the next box).
 *
 * Returns the snap delta along `axis` and the gap regions to draw. All spacing
 * bars are placed on the moving box's centerline for a consistent readout.
 */
export declare function spacingSnap(moving: Rect, statics: Rect[], axis: "x" | "y", threshold?: number): SpacingSnapResult;
export interface ResizeSpacingResult {
    /** Signed delta to apply to the dragged edge along its axis. */
    delta: number;
    axis: "x" | "y";
    /** The equalized gap size (page units). */
    gap: number;
    /** [from,to] of the two now-equal gaps (page coords) for drawing. */
    s1: [number, number];
    s2: [number, number];
    /** Cross-axis coordinate to draw the bars at (box center). */
    cross: number;
}
/**
 * Equal-spacing snap while resizing one edge of `moving`. `handle` is the edge
 * being dragged (e/w/n/s); the opposite (anchor) edge is held fixed. Returns a
 * delta for the dragged edge so the box's two gaps to its nearest neighbors on
 * that axis become equal (matching the moving-side gap to the fixed anchor-side
 * gap), plus the gap segments to render. Null when there isn't a neighbor on
 * both sides (overlapping the box on the cross axis) or the snap is out of range.
 */
export declare function resizeSpacingSnap(moving: Rect, handle: "e" | "w" | "n" | "s", statics: Rect[], threshold?: number): ResizeSpacingResult | null;
/**
 * Equal-spacing detection for 3+ boxes along an axis (FR-14). Returns the common
 * gap when consecutive gaps between sorted boxes match within tolerance.
 */
export declare function detectEqualSpacing(boxes: Rect[], axis: "x" | "y", tolerance?: number): {
    equal: boolean;
    gap: number;
};
