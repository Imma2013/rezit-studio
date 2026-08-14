"use strict";
// Duotone rendering for the Canvas2D path. The per-pixel
// luminance->gradient map (`applyDuotone`/`duotoneLut` in effects.ts) is pure
// and unit-tested; this module wraps it in an offscreen-canvas cache so a
// duotone image is recomputed only when its source, colors, or intensity change
// (never reprocess per frame). In environments without an
// offscreen canvas (headless test doubles), `duotoneCanvas` returns null and
// the renderer falls back to drawing the untreated image.
Object.defineProperty(exports, "__esModule", { value: true });
exports.duotoneCanvas = duotoneCanvas;
exports.clearDuotoneCache = clearDuotoneCache;
const effects_1 = require("./effects");
const color_1 = require("./color");
// Small LRU keyed by asset + colors + intensity + buffer size. Bounded so a
// long editing session never leaks offscreen buffers (LRU eviction).
const MAX_ENTRIES = 24;
const cache = [];
// Cap the processed buffer's longest side. A full-resolution photo can be many
// megapixels; the per-pixel duotone pass and the offscreen buffer cost scale
// with that. Bounding it here keeps memory and CPU in check while staying well
// above any on-screen display size (the result is drawn through drawImage,
// which rescales it to the node box, so the visual quality is unaffected).
const MAX_DIM = 2048;
function makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== "undefined")
        return new OffscreenCanvas(w, h);
    if (typeof document !== "undefined") {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        return c;
    }
    return null;
}
function get2d(c) {
    // willReadFrequently keeps getImageData fast for the cached single read.
    return c.getContext("2d", { willReadFrequently: true });
}
function lookup(key) {
    const i = cache.findIndex((e) => e.key === key);
    if (i < 0)
        return undefined;
    const [hit] = cache.splice(i, 1); // move to MRU end
    cache.push(hit);
    return hit.canvas;
}
function store(key, canvas) {
    cache.push({ key, canvas });
    while (cache.length > MAX_ENTRIES)
        cache.shift();
}
/**
 * Return a drawable (canvas) holding `image` with the duotone applied, sized to
 * the image's natural pixels. Cached by `assetId` + colors + intensity + size.
 * Returns null when no offscreen canvas is available or the image has no size,
 * so callers fall back to the untreated image.
 */
function duotoneCanvas(assetId, image, width, height, shadows, highlights, intensity) {
    const reqW = Math.max(1, Math.round(width));
    const reqH = Math.max(1, Math.round(height));
    if (reqW <= 0 || reqH <= 0)
        return null;
    // Bound the processed buffer to MAX_DIM on the longest side, preserving aspect.
    const scale = Math.min(1, MAX_DIM / Math.max(reqW, reqH));
    const w = Math.max(1, Math.round(reqW * scale));
    const h = Math.max(1, Math.round(reqH * scale));
    const key = `${assetId}|${w}x${h}|${(0, color_1.colorToCss)(shadows)}|${(0, color_1.colorToCss)(highlights)}|${intensity.toFixed(3)}`;
    const cached = lookup(key);
    if (cached)
        return cached;
    const canvas = makeCanvas(w, h);
    if (!canvas)
        return null;
    const ctx = get2d(canvas);
    if (!ctx)
        return null;
    try {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);
        const id = ctx.getImageData(0, 0, w, h);
        (0, effects_1.applyDuotone)(id.data, (0, effects_1.duotoneLut)(shadows, highlights), intensity);
        ctx.putImageData(id, 0, 0);
    }
    catch {
        // Tainted canvas (cross-origin image) or unsupported pixel access: skip.
        return null;
    }
    store(key, canvas);
    return canvas;
}
/** Clear the duotone cache (test/teardown helper). */
function clearDuotoneCache() {
    cache.length = 0;
}
