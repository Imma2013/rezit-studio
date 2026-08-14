import type { CharStyle } from "@hc/schema";
/** CSS font-family stack for a family name, with a system fallback. */
export declare function fontFamilyStack(family: string | undefined): string;
/** Numeric weight from a named style ("SemiBold" -> 600), default 400. */
export declare function weightFromFontStyle(fontStyle: string | undefined): number;
type FontLike = Pick<CharStyle, "fontFamily" | "fontStyle" | "fontSize"> & {
    axes?: Record<string, number>;
    case?: CharStyle["case"];
};
/** A Canvas2D `font` string (e.g. `italic small-caps 600 condensed 24px "Inter"`).
 *  Applies variable-font axes that Canvas2D can express: wght (weight), wdth
 *  (font-stretch keyword), and ital/slnt (italic). Other axes need the GPU path. */
export declare function canvasFontString(style: FontLike): string;
/** Resolve a line advance in px from a CharStyle lineHeight (default 1.2x). */
export declare function resolveLineAdvance(size: number, lineHeight: CharStyle["lineHeight"]): number;
/** Apply a case transform to display text. */
export declare function applyTextCase(text: string, textCase: CharStyle["case"]): string;
export {};
