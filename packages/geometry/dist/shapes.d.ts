import type { ShapeNode, SubPath, VectorAnchor, VectorPath } from "@hc/schema";
import { type ParametricShape } from "./types";
export declare function shapeToPath(shape: ParametricShape): VectorPath;
/** Bridge the doc-02 flat ShapeNode to a ParametricShape, or null for custom/path. */
export declare function shapeNodeToParametric(node: ShapeNode): ParametricShape | null;
export { type SubPath, type VectorAnchor, type VectorPath };
