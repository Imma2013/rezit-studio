import type { Color, Effect } from "@hc/schema";
/**
 * Map a single adjustment op onto zero or more CSS filter functions.
 *
 * Native CSS filters (brightness/contrast/saturate/grayscale/sepia/invert/
 * hue-rotate/blur) pass straight through. The extended ops that have no
 * native filter are approximated by combining native ones:
 *  - exposure: a brightness multiplier (1 + value).
 *  - warmth/temperature: a reversible white-balance-ish approximation, a small
 *    hue-rotate (warm toward red/orange, cool toward blue) plus a gentle
 *    saturation lift, symmetric around 0. Approximate but live.
 *  - tint: green<->magenta, approximated as a hue rotation about the green axis.
 *  - vibrance: a gentler saturation lift than `saturate`.
 *  - highlights/shadows: tonal pushes approximated with brightness+contrast.
 * Each op's neutral value is a no-op (identity) so a default slider changes
 * nothing (AC-2).
 */
export declare function adjustmentOpToFilters(name: string, value: number): string[];
/** A CSS filter string for a node's effects, or "none". */
export declare function effectsFilter(effects?: Effect[]): string;
export interface OutlineSpec {
    color: string;
    width: number;
}
/** Outline effects, as stroke specs to draw around the node box. */
export declare function outlineSpecs(effects?: Effect[]): OutlineSpec[];
/** The active duotone effect on a node, if any (the last one wins). */
export declare function duotoneEffect(effects?: Effect[]): (Effect & {
    kind: "duotone";
}) | undefined;
/** Rec. 601 luma of an sRGB triple in 0..255. Pure and allocation-free. */
export declare function luminance601(r: number, g: number, b: number): number;
/**
 * Build a 256-entry RGB lookup table that maps a luminance bucket (0..255) to
 * the duotone gradient color: dark pixels toward `shadows`, light pixels toward
 * `highlights`, linearly interpolated. Pure (no canvas), so it can be unit
 * tested and cached by the renderer keyed on the two colors.
 */
export declare function duotoneLut(shadows: Color, highlights: Color): Uint8ClampedArray;
/**
 * Apply a duotone map to RGBA pixel data in place, blending the mapped color
 * against the original by `intensity` (0 = original, 1 = full duotone). Alpha
 * is preserved. Pure over the buffer (no canvas), so it is unit testable and
 * reusable in the worker/headless paths. `lut` comes from {@link duotoneLut}.
 */
export declare function applyDuotone(data: Uint8ClampedArray, lut: Uint8ClampedArray, intensity: number): void;
