import type { Color } from "@hc/schema";
/** Anything `drawImage` can sample and `drawImage` onto (browser/worker). */
type Drawable = CanvasImageSource;
/**
 * Return a drawable (canvas) holding `image` with the duotone applied, sized to
 * the image's natural pixels. Cached by `assetId` + colors + intensity + size.
 * Returns null when no offscreen canvas is available or the image has no size,
 * so callers fall back to the untreated image.
 */
export declare function duotoneCanvas(assetId: string, image: Drawable, width: number, height: number, shadows: Color, highlights: Color, intensity: number): Drawable | null;
/** Clear the duotone cache (test/teardown helper). */
export declare function clearDuotoneCache(): void;
export {};
