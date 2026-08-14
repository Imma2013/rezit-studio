import { type Render2DOptions } from "./render2d";
import { type AssetProvider, type EngineConfig, type RenderContextKind, type Renderer, type RenderTarget, type Scene, type Viewport } from "./types";
/** Whether an accelerated context is usable. GPU paths are deferred, so this is
 *  currently always false and the engine cleanly uses Canvas2D (FR-13, AC-6). */
export declare function gpuAvailable(): boolean;
/** Choose the render context, honoring `preferGpu` and falling back to 2d. */
export declare function probeContext(target: RenderTarget, config: EngineConfig): RenderContextKind;
/** Mount a live renderer over a scene and target. An optional asset provider
 *  supplies loaded media/fonts and drives region-invalidation on load (FR-11). */
export declare function mountRenderer(scene: Scene, target: RenderTarget, config?: Partial<EngineConfig>, assets?: AssetProvider): Renderer;
export interface OneShotOptions extends Render2DOptions {
    viewport?: Viewport;
}
/** One-shot render (headless export and thumbnails). Renders the full
 *  page at 1:1 unless a viewport is supplied. */
export declare function render(scene: Scene, target: RenderTarget, opts?: OneShotOptions): void;
