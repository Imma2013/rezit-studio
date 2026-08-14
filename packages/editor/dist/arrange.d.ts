import type { Node } from "@hc/schema";
import type { Rect } from "@hc/engine";
export interface ArrangeItem {
    id: string;
    bounds: Rect;
}
export type Delta = {
    dx: number;
    dy: number;
};
export type AlignEdge = "left" | "hcenter" | "right" | "top" | "vmiddle" | "bottom";
export declare function alignDeltas(items: ArrangeItem[], edge: AlignEdge, target: Rect): Map<string, Delta>;
/** Distribute 3+ items evenly, by leading edge or by equal gaps (FR-17). */
export declare function distributeDeltas(items: ArrangeItem[], axis: "h" | "v", by: "edge" | "gap"): Map<string, Delta>;
/**
 * Tidy up: arrange a selection into a row with a uniform gap inferred from the
 * current spacing (default 16), top-aligned to the topmost item (FR-17).
 */
export declare function tidyUpDeltas(items: ArrangeItem[], defaultGap?: number): Map<string, Delta>;
/** Reorder selected nodes within a back-to-front children array (FR-18). */
export declare function order(children: Node[], ids: string[], op: "front" | "back" | "forward" | "backward"): Node[];
