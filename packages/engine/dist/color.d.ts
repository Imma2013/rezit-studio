import type { Color, Fill } from "@hc/schema";
export declare function colorToCss(color: Color): string;
/** A flat CSS color for a fill (gradients fall back to a representative stop;
 *  real gradient/image painting is a GPU/2d-path enhancement). */
export declare function fillToCss(fill: Fill): string;
