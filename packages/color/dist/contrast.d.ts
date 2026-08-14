import type { Color } from "@hc/schema";
/**
 * Relative luminance of a color per WCAG 2.x. Alpha is ignored here; callers
 * that need realistic contrast over a background should composite first via
 * {@link flatten}.
 */
export declare function relativeLuminance(c: Color): number;
/** Composite a (possibly translucent) foreground over an opaque background. */
export declare function flatten(fg: Color, bg: Color): Color;
/**
 * WCAG contrast ratio in [1, 21]. If the foreground is translucent it is first
 * composited over the background so the ratio reflects what is actually seen.
 */
export declare function contrastRatio(fg: Color, bg: Color): number;
export interface WcagResult {
    ratio: number;
    aaNormal: boolean;
    aaLarge: boolean;
    aaaNormal: boolean;
    aaaLarge: boolean;
}
/** WCAG 2.2 pass/fail at normal and large text for AA and AAA. */
export declare function wcag(fg: Color, bg: Color): WcagResult;
/**
 * Nudge a foreground color's lightness until it meets the requested contrast
 * threshold against `bg`, returning the nearest passing color (or the closest
 * achievable extreme if even pure black/white cannot reach it). FR-8 "Fix to AA".
 */
export declare function fixToAA(fg: Color, bg: Color, target?: number): Color;
