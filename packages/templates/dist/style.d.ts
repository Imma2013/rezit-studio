import { type DesignFile } from "@hc/schema";
import type { StyleDescriptor } from "./types";
/** Extract a StyleDescriptor from a design (FR-9). */
export declare function extractStyle(file: DesignFile, maxPalette?: number): StyleDescriptor;
export interface ApplyStyleResult {
    file: DesignFile;
    colorsRemapped: number;
    runsRestyled: number;
    /** Roles the target needed but the style did not define (nearest used). */
    approximated: string[];
}
/**
 * Re-skin a design to a StyleDescriptor (FR-7). Solid/gradient colors are
 * remapped positionally from the design's own palette onto the target palette;
 * text runs are restyled by role (largest run in a node = heading, else body).
 * Content (geometry and copy) is untouched. Pure: returns a new file.
 */
export declare function applyStyle(file: DesignFile, style: StyleDescriptor): ApplyStyleResult;
