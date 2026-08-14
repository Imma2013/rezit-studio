export interface Size {
    width: number;
    height: number;
}
/** Scale (w,h) down to fit inside (maxW,maxH) preserving aspect ratio. Never
 *  upscales (a smaller image is returned unchanged). Result is rounded. */
export declare function fitWithin(w: number, h: number, maxW: number, maxH: number): Size;
/** Scale (w,h) to completely cover (boxW,boxH) preserving aspect ratio (the
 *  image overflows the box on one axis); used for fill-style previews. */
export declare function coverSize(w: number, h: number, boxW: number, boxH: number): Size;
/** Square-bounded thumbnail size (default 512px on the longest edge). */
export declare function thumbnailSize(w: number, h: number, max?: number): Size;
/** The transform an EXIF orientation (1..8) encodes: a clockwise rotation in
 *  degrees plus an optional horizontal mirror, applied to display the image
 *  upright. Unknown values fall back to the identity (orientation 1). */
export interface ExifTransform {
    rotate: 0 | 90 | 180 | 270;
    mirrored: boolean;
}
export declare function exifTransform(orientation: number): ExifTransform;
/** The displayed dimensions after applying an EXIF orientation: width and height
 *  swap for the 90 deg / 270 deg rotations (orientations 5..8). */
export declare function orientedDimensions(w: number, h: number, orientation: number): Size;
