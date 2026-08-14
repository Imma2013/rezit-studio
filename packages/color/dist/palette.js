"use strict";
// Palette extraction (F09 FR-6, AC-4) via median-cut. Deterministic: the same
// bitmap and count always yield the same ordered swatches (no randomness).
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPalette = extractPalette;
const convert_1 = require("./convert");
/** Collect opaque-ish pixels, sampling at most `cap` of them for speed. */
function samplePixels(bmp, cap = 16384) {
    const total = bmp.width * bmp.height;
    if (total === 0)
        return [];
    const stride = Math.max(1, Math.floor(total / cap));
    const out = [];
    for (let i = 0; i < total; i += stride) {
        const o = i * 4;
        const a = bmp.data[o + 3];
        if (a < 8)
            continue; // skip transparent pixels
        out.push({ r: bmp.data[o], g: bmp.data[o + 1], b: bmp.data[o + 2] });
    }
    return out;
}
function rangeOf(px, ch) {
    let lo = 255;
    let hi = 0;
    for (const p of px) {
        const v = p[ch];
        if (v < lo)
            lo = v;
        if (v > hi)
            hi = v;
    }
    return hi - lo;
}
function widestChannel(px) {
    const r = rangeOf(px, "r");
    const g = rangeOf(px, "g");
    const b = rangeOf(px, "b");
    if (r >= g && r >= b)
        return "r";
    if (g >= b)
        return "g";
    return "b";
}
function averageColor(px) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const p of px) {
        r += p.r;
        g += p.g;
        b += p.b;
    }
    const n = px.length || 1;
    return (0, convert_1.color)(r / n / 255, g / n / 255, b / n / 255, 1);
}
/**
 * Extract `count` representative colors from a bitmap using median-cut.
 * Returns fewer than `count` only when the image has too few distinct pixels.
 * Ordered most-populous bucket first.
 */
function extractPalette(bmp, count = 6) {
    const target = Math.max(1, Math.floor(count));
    const pixels = samplePixels(bmp);
    if (pixels.length === 0)
        return [];
    let buckets = [pixels];
    // Repeatedly split the bucket with the largest channel range.
    while (buckets.length < target) {
        let bestIdx = -1;
        let bestRange = -1;
        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i].length < 2)
                continue;
            const ch = widestChannel(buckets[i]);
            const r = rangeOf(buckets[i], ch);
            if (r > bestRange) {
                bestRange = r;
                bestIdx = i;
            }
        }
        if (bestIdx < 0)
            break; // nothing left to split
        const bucket = buckets[bestIdx];
        const ch = widestChannel(bucket);
        const sorted = [...bucket].sort((a, b) => a[ch] - b[ch]);
        const mid = sorted.length >> 1;
        buckets.splice(bestIdx, 1, sorted.slice(0, mid), sorted.slice(mid));
    }
    return buckets
        .filter((b) => b.length > 0)
        .sort((a, b) => b.length - a.length)
        .map(averageColor);
}
