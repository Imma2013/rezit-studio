import type { PrintProduct, PrintSize } from "./types";
/** Millimetres -> pixels at a given dpi. */
export declare function mmToPx(mm: number, dpi: number): number;
/** Pixels -> millimetres at a given dpi. */
export declare function pxToMm(px: number, dpi: number): number;
/** Millimetres -> PostScript points (1pt = 1/72 inch). */
export declare function mmToPt(mm: number): number;
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface PrintRects {
    /** Outermost box: the full printed sheet including bleed. */
    bleed: Rect;
    /** Trim box: the finished cut size, inset from bleed by bleedMm on all sides. */
    trim: Rect;
    /** Safe box: important content area, inset from trim by safeZoneMm. */
    safe: Rect;
}
/**
 * The bleed / trim / safe rectangles for a finished (trim) size in mm. The bleed
 * box is the outermost rectangle with its top-left at the origin; the trim box
 * is inset by `bleedMm` on every side; the safe box is inset a further
 * `safeZoneMm` inside the trim. (FR-2, FR-4.)
 */
export declare function printRects(widthMm: number, heightMm: number, bleedMm: number, safeZoneMm: number): PrintRects;
export interface MarkLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface CropMarkOptions {
    /** Length of each crop-mark stroke in mm (default 3mm). */
    markLengthMm?: number;
    /** Gap between the trim edge and the start of the mark in mm (default 1mm). */
    offsetMm?: number;
}
/**
 * Printer crop marks for the trim box: two strokes at each of the four corners,
 * sitting in the bleed margin and not crossing into the trim area (FR-2). All
 * coordinates are in mm in the same space as printRects (bleed box at origin).
 * Marks are clamped so they never extend past the bleed sheet edge.
 */
export declare function cropMarks(rects: PrintRects, opts?: CropMarkOptions): MarkLine[];
export type FitMode = "cover" | "contain";
export interface DesignFit {
    scale: number;
    offsetX: number;
    offsetY: number;
    mode: FitMode;
}
/**
 * Map a design (given as width/height in px at some dpi) onto a product's print
 * area for `sizeId`. The print area is the bleed box (so content fills to the
 * bleed). Uses a cover fit by default so the bleed box is fully covered; offsets
 * centre the scaled design and are in design pixels (negative when the design
 * overflows the target, i.e. is cropped). The returned `scale` is the multiplier
 * applied to the design's pixels to reach the target measured in mm-space px
 * (the target box expressed at the design's own dpi via `printRects`).
 *
 * Math is resolution-independent: `scale` is unitless (target-mm per design-px
 * ratio along the chosen axis). Callers convert with `mmToPx` for rendering.
 */
export declare function fitDesignToProduct(designW: number, designH: number, product: PrintProduct, sizeId: string, mode?: FitMode): DesignFit;
/**
 * Effective PPI for a standalone source: natural source pixels along an axis
 * divided by the rendered physical size of that axis. `renderedSizePx` is the
 * placed size measured in pixels at `dpi`; the result is natural pixels per inch
 * once the rendered size is converted to inches. Returns 0 when undeterminable.
 *
 * For placed `ImageNode`s inside a `DesignFile`, prefer @hc/engine's
 * `computeEffectivePpi` (re-exported by the pre-flight module), which accounts
 * for crop and transform; this helper is the raw ratio for simple cases.
 */
export declare function effectivePpi(naturalPx: number, renderedSizePx: number, dpi: number): number;
export type QualityBadge = "good" | "warn" | "fail";
/**
 * Quality badge from an effective PPI against the product's required DPI (FR-4):
 * `good` at/above the requirement, `warn` within 75%..100% of it, `fail` below
 * 75%. Below the requirement is never `good`.
 */
export declare function qualityBadge(effective: number, requiredDpi: number): QualityBadge;
/** Convenience: the trim (finished) size in mm for a product size. */
export declare function trimSizeMm(size: PrintSize): {
    widthMm: number;
    heightMm: number;
};
