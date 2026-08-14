import type { Point } from "./routing";
export interface Graph {
    nodes: string[];
    edges: [string, string][];
}
export interface FlowchartOpts {
    layerGap?: number;
    nodeGap?: number;
    direction?: "down" | "right";
}
/**
 * Layered (Sugiyama-style) layout. Returns a position per node id.
 * The layer axis follows `direction` ("down" => layers stacked vertically,
 * y grows with layer; "right" => layers left-to-right, x grows with layer).
 */
export declare function layoutFlowchart(graph: Graph, opts?: FlowchartOpts): Record<string, Point>;
export interface MindMapOpts {
    radiusStep?: number;
}
/**
 * Radial mind-map layout. BFS levels from `root`; root at origin, each deeper
 * level placed on a circle of radius level*radiusStep. Each node receives an
 * angular slice of its parent's slice, so subtrees stay clustered near parents.
 */
export declare function layoutMindMap(root: string, graph: Graph, opts?: MindMapOpts): Record<string, Point>;
