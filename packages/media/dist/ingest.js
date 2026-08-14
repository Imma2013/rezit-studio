"use strict";
// Ingest geometry: the pure dimension math the upload pipeline needs to
// generate thumbnails/previews and to normalize EXIF orientation, independent of
// any image codec. The worker decodes pixels; these helpers decide the target
// size and the orientation transform to bake in.
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitWithin = fitWithin;
exports.coverSize = coverSize;
exports.thumbnailSize = thumbnailSize;
exports.exifTransform = exifTransform;
exports.orientedDimensions = orientedDimensions;
/** Scale (w,h) down to fit inside (maxW,maxH) preserving aspect ratio. Never
 *  upscales (a smaller image is returned unchanged). Result is rounded. */
function fitWithin(w, h, maxW, maxH) {
    if (w <= 0 || h <= 0)
        return { width: 0, height: 0 };
    const scale = Math.min(1, maxW / w, maxH / h);
    return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}
/** Scale (w,h) to completely cover (boxW,boxH) preserving aspect ratio (the
 *  image overflows the box on one axis); used for fill-style previews. */
function coverSize(w, h, boxW, boxH) {
    if (w <= 0 || h <= 0)
        return { width: 0, height: 0 };
    const scale = Math.max(boxW / w, boxH / h);
    return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}
/** Square-bounded thumbnail size (default 512px on the longest edge). */
function thumbnailSize(w, h, max = 512) {
    return fitWithin(w, h, max, max);
}
const EXIF_TRANSFORMS = {
    1: { rotate: 0, mirrored: false },
    2: { rotate: 0, mirrored: true },
    3: { rotate: 180, mirrored: false },
    4: { rotate: 180, mirrored: true },
    5: { rotate: 90, mirrored: true },
    6: { rotate: 90, mirrored: false },
    7: { rotate: 270, mirrored: true },
    8: { rotate: 270, mirrored: false },
};
function exifTransform(orientation) {
    return EXIF_TRANSFORMS[orientation] ?? EXIF_TRANSFORMS[1];
}
/** The displayed dimensions after applying an EXIF orientation: width and height
 *  swap for the 90 deg / 270 deg rotations (orientations 5..8). */
function orientedDimensions(w, h, orientation) {
    const { rotate } = exifTransform(orientation);
    return rotate === 90 || rotate === 270 ? { width: h, height: w } : { width: w, height: h };
}
