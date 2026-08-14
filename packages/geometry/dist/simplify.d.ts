import type { Point } from "./types";
/**
 * Ramer-Douglas-Peucker simplification: returns a subset of `points` (always
 * including the first and last) such that every dropped point lies within
 * `tolerance` of the retained polyline. A noisy stroke collapses to far fewer
 * points; tolerance 0 returns the input unchanged (minus exact duplicates).
 */
export declare function simplifyPolyline(points: Point[], tolerance: number): Point[];
/** A fitted cubic bezier: endpoints p0/p3 with absolute control points c1/c2. */
export interface CubicBezier {
    p0: Point;
    c1: Point;
    c2: Point;
    p3: Point;
}
/**
 * Fit a polyline to a minimal set of smooth cubic bezier segments within
 * `tolerance` (max perpendicular sample error). Endpoint tangents are derived
 * from the neighbouring samples, so adjacent fitted segments meet smoothly.
 * Returns an empty array for fewer than two distinct points.
 */
export declare function fitCubicBeziers(points: Point[], tolerance: number): CubicBezier[];
