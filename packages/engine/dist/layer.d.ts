import type { CanvasLike } from "./types";
export type LayerCanvas = HTMLCanvasElement | OffscreenCanvas;
/** An offscreen buffer, or null where the runtime has no canvas to give. */
export declare function makeLayerCanvas(w: number, h: number): LayerCanvas | null;
/** A 2D context for a layer, or null when the runtime declines to provide one. */
export declare function layerContext(c: LayerCanvas): CanvasLike | null;
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
export declare function needsIsolation(node: {
    opacity: number;
    blendMode?: string;
    isolation?: boolean;
}, kids: number): boolean;
