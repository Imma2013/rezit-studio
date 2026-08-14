"use strict";
// Image authoring helpers: placement sizing (FR-2) and replace-in-place
// aspect logic (FR-10). Pure; the editor app wires these into transactions.
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeImageSize = placeImageSize;
exports.replaceImageSource = replaceImageSource;
/**
 * Size a newly-placed image so its longest edge is ~`fraction` of the smaller
 * viewport dimension, preserving the source aspect ratio (FR-2).
 */
function placeImageSize(naturalWidth, naturalHeight, viewportWidth, viewportHeight, fraction = 0.8) {
    if (naturalWidth <= 0 || naturalHeight <= 0) {
        const s = Math.min(viewportWidth, viewportHeight) * fraction;
        return { width: s, height: s };
    }
    const targetLongest = Math.min(viewportWidth, viewportHeight) * fraction;
    const scale = targetLongest / Math.max(naturalWidth, naturalHeight);
    return { width: naturalWidth * scale, height: naturalHeight * scale };
}
function aspect(w, h) {
    return h > 0 ? w / h : 0;
}
/**
 * Replace an image's source in place, preserving fit/focal/flip. The crop is
 * kept only when the new source has the same aspect ratio; otherwise it resets
 * to full source and `aspectChanged` is true so the UI can notify (FR-10).
 */
function replaceImageSource(node, newSource, tolerance = 1e-3) {
    const oldAspect = aspect(node.source.naturalWidth, node.source.naturalHeight);
    const newAspect = aspect(newSource.naturalWidth, newSource.naturalHeight);
    const aspectChanged = oldAspect <= 0 || newAspect <= 0 || Math.abs(oldAspect - newAspect) > tolerance;
    const next = { ...node, source: newSource };
    if (aspectChanged)
        delete next.crop;
    return { node: next, aspectChanged };
}
