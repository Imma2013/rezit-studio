import type { RasterOptions } from "./types";
export interface PixelSize {
    width: number;
    height: number;
    scale: number;
    dpi: number;
}
/**
 * Compute the output pixel size for a page. `scale` takes precedence; otherwise
 * an explicit `dpi` is converted to a scale via the source DPI; otherwise 1x.
 * Dimensions are rounded to whole pixels.
 */
export declare function rasterDimensions(page: {
    width: number;
    height: number;
}, opts?: RasterOptions, sourceDpi?: number): PixelSize;
