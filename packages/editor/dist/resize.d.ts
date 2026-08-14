import type { Page } from "@hc/schema";
export interface ResizeTarget {
    width: number;
    height: number;
}
/**
 * Re-lay-out a page to a new size, constraint-aware (NOT a uniform scale).
 * Returns a NEW Page with the same node ids, z-order, and group structure, and
 * new transforms/sizes mapped to the target. The source page is not mutated.
 *
 * Only un-rotated top-level nodes are anchor-mapped; a rotated node keeps its
 * rotation and is treated by its axis-aligned origin (best effort). Nested
 * children move with their group (the group is re-placed as a unit).
 */
export declare function resizePage(page: Page, target: ResizeTarget): Page;
