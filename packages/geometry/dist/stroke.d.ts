import type { VectorPath } from "@hc/schema";
import type { Point, Rect } from "./types";
/** Convert a stroked path into a filled outline path of the given width. */
export declare function strokeToOutline(path: VectorPath, width: number, steps?: number): VectorPath;
export type RecognizedShape = {
    kind: "line";
    from: Point;
    to: Point;
} | {
    kind: "rect";
    bbox: Rect;
} | {
    kind: "ellipse";
    bbox: Rect;
} | {
    kind: "triangle";
    bbox: Rect;
} | {
    kind: "polygon";
    bbox: Rect;
    sides: number;
};
/** Classify a freehand polyline into a clean shape, or null to keep as-is. */
export declare function recognizeShape(points: Point[]): RecognizedShape | null;
