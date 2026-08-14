import type { Color } from "@hc/schema";
/** Ordered qualitative swatches (hex), tuned for legibility on light surfaces. */
export declare const SERIES_PALETTE_HEX: readonly ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6"];
/** The default series palette as `Color`s, cycling when `count` exceeds the
 *  base scheme so any number of series gets a distinct-as-possible color. */
export declare function seriesPalette(count: number): Color[];
/** The default color for the series at `index` (cycles through the palette). */
export declare function seriesColorAt(index: number): Color;
