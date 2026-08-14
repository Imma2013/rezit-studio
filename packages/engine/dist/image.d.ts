import type { DesignFile, ImageNode, Unit } from "@hc/schema";
export declare function unitToInches(value: number, unit: Unit, dpi: number): number;
/**
 * Effective PPI of a placed image = visible source pixels / placed physical size,
 * taking the smaller of the two axes (FR-8). Returns 0 when undeterminable.
 */
export declare function computeEffectivePpi(node: ImageNode, file: DesignFile): number;
/** Low-resolution threshold: print pages (non-px units) want more PPI (FR-9). */
export declare function lowResThreshold(file: DesignFile): number;
export declare function isLowResolution(node: ImageNode, file: DesignFile): boolean;
export interface FitRect {
    /** Source sub-rectangle to sample, normalized 0..1 of the (cropped) source. */
    source: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Destination rectangle within the box, in box pixels. */
    dest: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
/**
 * Map a source of `srcW`x`srcH` into a `boxW`x`boxH` box under a fit mode and
 * focal point (normalized). `cover` crops via the focal point; `contain`
 * letterboxes; `stretch` distorts to fill; `none` is 1:1 centered.
 */
export declare function fitRect(srcW: number, srcH: number, boxW: number, boxH: number, fit: ImageNode["fit"], focal?: {
    x: number;
    y: number;
}): FitRect;
