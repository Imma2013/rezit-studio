import type { CharStyle, TextNode } from "@hc/schema";
export type MeasureFn = (text: string, style: CharStyle) => number;
/** Default advance approximation (~0.55em per char + tracking). */
export declare const approximateMeasure: MeasureFn;
/** A run of one or more tab characters (used by both layout and rendering so
 *  tab advances agree). */
export declare const isTabRun: (text: string) => boolean;
/** Next tab stop at or past `pos`, honoring explicit `tabStops` then falling
 *  back to a default grid of `em * 4`. Shared by layout (wrap width) and the
 *  renderer (glyph advance) so a tab lands in the same place in both. */
export declare function nextTabStop(pos: number, tabStops: number[] | undefined, em: number): number;
/** Total width of a run of tabs starting at `pos`. */
export declare function tabRunWidth(text: string, pos: number, tabStops: number[] | undefined, em: number): number;
export interface LineSegment {
    text: string;
    style: CharStyle;
}
export interface LineBox {
    paragraph: number;
    y: number;
    height: number;
    width: number;
    align: "left" | "center" | "right" | "justify";
    segments: LineSegment[];
    /** Left offset of the text within the content box (indent + list gutter). */
    x: number;
    /** List marker drawn in the gutter on the paragraph's first line, if any. */
    marker?: {
        text: string;
        style: CharStyle;
        x: number;
    };
    /** Multi-column flow: the left origin of this line's column relative to the
     *  content box, and the column's width. Absent for single-column layout. */
    colLeft?: number;
    colWidth?: number;
    /** The paragraph's resolved base direction (F38 FR-10). `segments` are in
     *  DISPLAY order, so a renderer draws them left to right regardless; this is
     *  here so alignment and caret placement can respect the base direction. */
    direction: "ltr" | "rtl";
}
export interface LayoutResult {
    lines: LineBox[];
    width: number;
    height: number;
}
export interface LayoutOptions {
    measure?: MeasureFn;
}
export declare function layoutText(node: TextNode, opts?: LayoutOptions): LayoutResult;
/** Content size of a text node under the given measure. */
export declare function measureText(node: TextNode, opts?: LayoutOptions): {
    width: number;
    height: number;
};
