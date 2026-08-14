"use strict";
// WCAG 2.2 contrast (F09 FR-8, AC-6). Pure functions over canonical sRGB.
Object.defineProperty(exports, "__esModule", { value: true });
exports.relativeLuminance = relativeLuminance;
exports.flatten = flatten;
exports.contrastRatio = contrastRatio;
exports.wcag = wcag;
exports.fixToAA = fixToAA;
const convert_1 = require("./convert");
/** sRGB component (0..1) linearized per WCAG. */
function lin(v) {
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
/**
 * Relative luminance of a color per WCAG 2.x. Alpha is ignored here; callers
 * that need realistic contrast over a background should composite first via
 * {@link flatten}.
 */
function relativeLuminance(c) {
    const { r, g, b } = c.srgb;
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
/** Composite a (possibly translucent) foreground over an opaque background. */
function flatten(fg, bg) {
    const a = (0, convert_1.clamp01)(fg.srgb.a);
    if (a >= 1)
        return fg;
    const mix = (f, b) => f * a + b * (1 - a);
    return {
        srgb: {
            r: mix(fg.srgb.r, bg.srgb.r),
            g: mix(fg.srgb.g, bg.srgb.g),
            b: mix(fg.srgb.b, bg.srgb.b),
            a: 1,
        },
    };
}
/**
 * WCAG contrast ratio in [1, 21]. If the foreground is translucent it is first
 * composited over the background so the ratio reflects what is actually seen.
 */
function contrastRatio(fg, bg) {
    const f = relativeLuminance(flatten(fg, bg));
    const b = relativeLuminance(bg);
    const lighter = Math.max(f, b);
    const darker = Math.min(f, b);
    return (lighter + 0.05) / (darker + 0.05);
}
/** WCAG 2.2 pass/fail at normal and large text for AA and AAA. */
function wcag(fg, bg) {
    const ratio = contrastRatio(fg, bg);
    return {
        ratio,
        aaNormal: ratio >= 4.5,
        aaLarge: ratio >= 3.0,
        aaaNormal: ratio >= 7.0,
        aaaLarge: ratio >= 4.5,
    };
}
/**
 * Nudge a foreground color's lightness until it meets the requested contrast
 * threshold against `bg`, returning the nearest passing color (or the closest
 * achievable extreme if even pure black/white cannot reach it). FR-8 "Fix to AA".
 */
function fixToAA(fg, bg, target = 4.5) {
    if (contrastRatio(fg, bg) >= target)
        return fg;
    const bgLum = relativeLuminance(bg);
    // Move away from the background's luminance: darken on light bg, lighten on dark.
    const goDarker = bgLum > 0.5;
    const hsl = (0, convert_1.rgbToHsl)(fg);
    let best = fg;
    let bestRatio = contrastRatio(fg, bg);
    // Walk lightness in fine steps toward the contrasting extreme.
    const steps = 100;
    for (let i = 1; i <= steps; i++) {
        const l = goDarker
            ? (0, convert_1.clamp01)(hsl.l * (1 - i / steps))
            : (0, convert_1.clamp01)(hsl.l + (1 - hsl.l) * (i / steps));
        const candidate = (0, convert_1.hslToRgb)({ ...hsl, l });
        const r = contrastRatio(candidate, bg);
        if (r > bestRatio) {
            bestRatio = r;
            best = candidate;
        }
        if (r >= target)
            return candidate;
    }
    return best;
}
