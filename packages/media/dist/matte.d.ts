export interface MatteRefineOptions {
    /** Contract the matte edge inward by this many pixels (kills haloes). */
    shrink?: number;
    /** Soften the edge with a blur of this radius (feathering). */
    feather?: number;
    /** Expand the matte edge outward by this many pixels (recover thin detail). */
    grow?: number;
}
export interface BrushStamp {
    cx: number;
    cy: number;
    radius: number;
    /** Target alpha the brush paints toward: 0 erases, 255 restores. */
    value: number;
    /** 0 = soft falloff to the edge, 1 = hard edge. */
    hardness?: number;
    /** Overall strength 0..1 applied to the stamp (default 1). */
    flow?: number;
}
/** Grow (dilate) the matte by `radius` pixels. */
export declare function growMatte(alpha: Uint8Array, w: number, h: number, radius: number): Uint8Array;
/** Shrink (erode) the matte by `radius` pixels. */
export declare function shrinkMatte(alpha: Uint8Array, w: number, h: number, radius: number): Uint8Array;
/** Feather the matte edge with a blur of `radius` pixels. */
export declare function featherMatte(alpha: Uint8Array, w: number, h: number, radius: number): Uint8Array;
/** Classic "refine edges": optional grow, then shrink (choke), then feather. */
export declare function refineMatte(alpha: Uint8Array, w: number, h: number, opts?: MatteRefineOptions): Uint8Array;
/** Paint a brush stamp into the matte in place (manual erase/restore touch-up).
 *  Returns the same buffer for chaining. Soft falloff respects `hardness`. */
export declare function brushMatte(alpha: Uint8Array, w: number, h: number, stamp: BrushStamp): Uint8Array;
/** Apply a matte to an RGBA buffer in place by multiplying the existing alpha by
 *  the matte (matte 255 keeps the pixel, 0 cuts it out). Returns the buffer. */
export declare function applyMatteToRGBA(rgba: Uint8Array | Uint8ClampedArray, alpha: Uint8Array): Uint8Array | Uint8ClampedArray;
