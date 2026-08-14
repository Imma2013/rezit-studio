import type { EndPoint } from "@hc/schema";
export interface Point {
    x: number;
    y: number;
}
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type Anchor = "top" | "right" | "bottom" | "left" | "center" | "auto";
/**
 * The connection point on a box for a given anchor. "center" returns the box
 * center; "auto" picks the side whose midpoint is nearest `toward` (falling
 * back to the right side when `toward` is absent).
 */
export declare function anchorPoint(box: Box, anchor: Anchor, toward?: Point): Point;
export interface RoutableConnector {
    route: "straight" | "elbow" | "curved";
    start: EndPoint;
    end: EndPoint;
    /** Optional user-placed bend points the route must visit, in order (FR-8). */
    waypoints?: Point[];
}
/**
 * Build the polyline for a connector. Deterministic and pure.
 *  - "straight": [start, end].
 *  - "elbow": orthogonal route, splitting on the dominant axis (3 to 5 points).
 *  - "curved": the elbow's endpoints plus a single midpoint control; the
 *     renderer draws the smooth curve through these.
 */
export declare function routeConnector(conn: RoutableConnector, boxes: Record<string, Box>): Point[];
