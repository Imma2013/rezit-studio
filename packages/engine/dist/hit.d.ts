import type { Node } from "@hc/schema";
import type { Point } from "./math";
/**
 * True if a local-space point lies within a node's geometry. When `precise` is
 * false, only the bounding box is tested. Pixel-alpha hit-testing (sampling the
 * rendered alpha) is deferred to the GPU/canvas path; shape geometry is used
 * here for ellipses, polygons, stars, and lines.
 */
export declare function pointInLocalShape(node: Node, p: Point, precise: boolean): boolean;
