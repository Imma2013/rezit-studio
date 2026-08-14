import type { PathSegment } from "@hc/schema";
export interface SubPathData {
    segments: PathSegment[];
    closed: boolean;
}
/** Parse an SVG path `d` string into one or more editable subpaths. */
export declare function parsePathData(d: string): SubPathData[];
/** True when the path uses arc commands (approximated; caller may flag fidelity). */
export declare function pathUsesArcs(d: string): boolean;
