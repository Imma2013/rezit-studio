import type { Color } from "@hc/schema";
/** A point in CIE L*a*b* (D65). */
export interface Lab {
    l: number;
    a: number;
    b: number;
}
/**
 * Convert a Color to CIE L*a*b*. Alpha is ignored (matching is over the visible
 * hue/lightness, not transparency). sRGB is linearized, projected to XYZ under
 * D65, then to Lab.
 */
export declare function rgbToLab(c: Color): Lab;
/** CIE76 deltaE: Euclidean distance in Lab. Symmetric; 0 means identical. */
export declare function deltaE(a: Color, b: Color): number;
/** The result of a nearest-color lookup: the matched swatch, its index in the
 *  palette, and the perceptual distance to the query (smaller is closer). */
export interface NearestMatch {
    color: Color;
    index: number;
    distance: number;
}
/**
 * Find the perceptually nearest color in `palette` to `target` (FR-3). Returns
 * null only when the palette is empty (the caller then keeps the original color,
 * never forcing a bad match edge case). Deterministic: ties resolve to
 * the earliest palette entry, so re-skin is reproducible.
 */
export declare function nearestPaletteColor(target: Color, palette: readonly Color[]): NearestMatch | null;
