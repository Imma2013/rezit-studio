import type { SubPath, VectorPath } from "@hc/schema";
import type { Point } from "./types";
/** Flatten one subpath to a polyline of points. */
export declare function subpathToPolyline(sub: SubPath, steps?: number): Point[];
/** Polyline points per subpath. */
export declare function pathToPolylines(path: VectorPath, steps?: number): Point[][];
/** Flatten a whole path into a curve-free VectorPath (anchors only). */
export declare function flatten(path: VectorPath, steps?: number): VectorPath;
