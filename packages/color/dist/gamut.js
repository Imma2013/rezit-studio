"use strict";
// CMYK gamut check (F09 FR-12, AC-7). Determines whether an sRGB color survives
// a round trip into the target CMYK profile, and if not, offers the nearest
// in-gamut suggestion (the round-tripped color, which is by construction
// reproducible in CMYK).
//
// Uses the naive device CMYK transform for v1 (matching `convert.ts`); a real
// ICC/CMM round trip can replace the internals without changing the signature.
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamutCheck = gamutCheck;
const convert_1 = require("./convert");
/** Euclidean distance in sRGB space (ignoring alpha). */
function dist(a, b) {
    const dr = a.srgb.r - b.srgb.r;
    const dg = a.srgb.g - b.srgb.g;
    const db = a.srgb.b - b.srgb.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}
/**
 * Check whether `c` is reproducible in `cmykProfile`. A color is considered in
 * gamut when the sRGB -> CMYK -> sRGB round trip returns (within tolerance) the
 * same color. The round-tripped color is the nearest in-gamut suggestion.
 */
function gamutCheck(c, cmykProfile, tolerance = 1 / 255) {
    const round = (0, convert_1.cmykToRgb)((0, convert_1.rgbToCmyk)(c, cmykProfile), cmykProfile);
    // Carry the original alpha through; gamut concerns the chromatic channels.
    round.srgb.a = c.srgb.a;
    const d = dist(c, round);
    if (d <= tolerance)
        return { inGamut: true };
    return { inGamut: false, nearest: round };
}
