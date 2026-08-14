"use strict";
// Offscreen layers for group isolation (F40 Phase 1 groundwork).
//
// Group opacity multiplied DOWN per child (`parentAlpha * node.opacity`)
// instead of compositing the group as a unit. The difference is visible the
// moment two children in a semi-transparent group overlap: each is drawn at the
// group's alpha independently, so the overlap is darker than the rest and the
// group shows seams along every shared edge. A group blend mode fared worse
// still, because each child re-sets `globalCompositeOperation` for its own
// blend and the group's is simply lost.
//
// Both need the same thing: draw the subtree into its own buffer at full
// strength, then composite that buffer once.
//
// The engine must stay usable in a tab, in a worker, and headless, so nothing
// here assumes a DOM. `makeLayerCanvas` mirrors the probe `duotone.ts` already
// uses for its offscreen cache, and every caller treats a null result as "this
// runtime cannot isolate", falling back to the previous multiply-down path
// rather than failing to draw.
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLayerCanvas = makeLayerCanvas;
exports.layerContext = layerContext;
exports.needsIsolation = needsIsolation;
/** An offscreen buffer, or null where the runtime has no canvas to give. */
function makeLayerCanvas(w, h) {
    if (w <= 0 || h <= 0)
        return null;
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
/** A 2D context for a layer, or null when the runtime declines to provide one. */
function layerContext(c) {
    // No `willReadFrequently` here, unlike duotone: a layer is composited with
    // drawImage and never read back, and the hint pushes some browsers onto a
    // slower software path.
    const ctx = c.getContext("2d");
    return ctx ?? null;
}
/**
 * Whether a node's children must be composited as a unit rather than
 * individually.
 *
 * `kids > 1` guards the opacity case on purpose. With a single child there is
 * nothing to overlap, so multiplying the alpha down produces exactly the same
 * pixels as compositing a layer would, and allocating a full-canvas buffer for
 * it would be pure cost. Blend and an explicit isolation request are different:
 * they change the compositing MODEL rather than just the alpha, so they matter
 * even for one child.
 */
function needsIsolation(node, kids) {
    if (kids === 0)
        return false;
    if (node.blendMode && node.blendMode !== "normal")
        return true;
    if (node.isolation)
        return true;
    return node.opacity < 1 && kids > 1;
}
