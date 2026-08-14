import type { CanvasLike } from "./types";
/**
 * Composite `img` with `mask`, returning a cached canvas, or null where the
 * runtime has no canvas or the inputs are unusable.
 *
 * Returning null rather than throwing is deliberate: the caller then draws the
 * UNMASKED image. Both outcomes are wrong when a mask exists, but showing the
 * whole photo is recoverable and obvious, whereas failing to draw leaves a hole
 * the user cannot diagnose.
 */
export declare function maskedCanvas(key: string, img: CanvasImageSource, mask: CanvasImageSource, naturalWidth: number, naturalHeight: number): (HTMLCanvasElement | OffscreenCanvas) | null;
/** Drop cached composites. For tests and for an explicit invalidation. */
export declare function clearMaskCache(): void;
/** Whether a context can support masking at all, so callers can probe once. */
export declare function maskingAvailable(ctx: CanvasLike): boolean;
