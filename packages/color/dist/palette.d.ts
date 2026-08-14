import type { Color } from "@hc/schema";
/** Minimal RGBA bitmap, compatible with ImageData (data is RGBA, 0..255). */
export interface Bitmap {
    width: number;
    height: number;
    data: Uint8ClampedArray | number[];
}
/**
 * Extract `count` representative colors from a bitmap using median-cut.
 * Returns fewer than `count` only when the image has too few distinct pixels.
 * Ordered most-populous bucket first.
 */
export declare function extractPalette(bmp: Bitmap, count?: number): Color[];
