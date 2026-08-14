import type { CanvasLike } from "./types";
type Pt = {
    x: number;
    y: number;
};
type Cmd = {
    op: "M" | "L";
    p: Pt;
} | {
    op: "C";
    c1: Pt;
    c2: Pt;
    p: Pt;
} | {
    op: "Z";
};
/** Parse a path `d` string into absolute moveTo/lineTo/cubic/close commands. */
export declare function parsePathCommands(d: string): Cmd[];
/**
 * Build the parsed path onto `ctx`, scaling its bounding box to fill w x h.
 * Returns false if nothing usable was parsed (caller should fall back to a rect).
 */
export declare function buildClipFromPathData(ctx: CanvasLike, d: string, w: number, h: number): boolean;
export {};
