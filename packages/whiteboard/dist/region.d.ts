import { type DesignFile } from "@hc/schema";
import type { Box } from "./routing";
export interface RegionScope {
    frameId?: string;
    nodeIds?: string[];
    rect?: Box;
}
export interface ExtractOpts {
    target?: "design" | "presentation";
}
/**
 * Build a new DesignFile from a region of `design`.
 *  - frameId pointing at a frame that itself contains child frames (sections):
 *    one page per child frame (its own children localized to that section).
 *  - frameId pointing at a plain frame: one page with the frame's children.
 *  - nodeIds: one page with the selected nodes (searched across all pages).
 *  - rect: one page with all top-level nodes intersecting the rect.
 */
export declare function extractRegion(design: DesignFile, scope: RegionScope, opts?: ExtractOpts): DesignFile;
