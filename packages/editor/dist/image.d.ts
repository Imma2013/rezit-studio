import type { ImageNode, ImageSource, Size } from "@hc/schema";
/**
 * Size a newly-placed image so its longest edge is ~`fraction` of the smaller
 * viewport dimension, preserving the source aspect ratio (FR-2).
 */
export declare function placeImageSize(naturalWidth: number, naturalHeight: number, viewportWidth: number, viewportHeight: number, fraction?: number): Size;
/**
 * Replace an image's source in place, preserving fit/focal/flip. The crop is
 * kept only when the new source has the same aspect ratio; otherwise it resets
 * to full source and `aspectChanged` is true so the UI can notify (FR-10).
 */
export declare function replaceImageSource(node: ImageNode, newSource: ImageSource, tolerance?: number): {
    node: ImageNode;
    aspectChanged: boolean;
};
