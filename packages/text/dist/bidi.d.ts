/**
 * Resolve a paragraph's base direction (UAX #9 P2 and P3). "auto" takes the
 * direction of the first strong character, defaulting to left-to-right when
 * there is none, which is what an empty or digits-only paragraph should do.
 */
export declare function resolveBaseDirection(text: string, declared?: "ltr" | "rtl" | "auto"): "ltr" | "rtl";
/**
 * Embedding level per character of a single line, following the resolution
 * rules of UAX #9 (W1 to W7, N1 and N2, I1 and I2) for the subset described in
 * the file header. Returns one level per code UNIT so callers can slice the
 * original string directly; a surrogate pair carries the same level twice.
 */
export declare function resolveLevels(text: string, base: "ltr" | "rtl"): number[];
/** A run of text sharing one embedding level, in logical order. */
export interface BidiRun {
    /** Index into the source string (code units). */
    start: number;
    end: number;
    level: number;
}
/** Split a line into level runs, then reorder them for display (UAX #9 L2:
 *  reverse each maximal run of levels at or above each level, highest first). */
export declare function reorderRuns(levels: number[]): BidiRun[];
/** A piece of a line to be drawn, carrying which source item it came from. */
export interface OrderedPiece<T> {
    /** The item (style run) this piece belongs to. */
    item: T;
    /** The substring to draw, already in logical order within the piece. */
    text: string;
    /** Even is left-to-right, odd is right-to-left. */
    level: number;
}
/**
 * Reorder a line's style runs into display order.
 *
 * The renderer draws each returned piece left to right at increasing x, so the
 * bidi ordering lives here rather than in every renderer. Within a piece the
 * text is left in logical order, because the text drawing API (Canvas2D
 * `fillText`, and the same for the headless path) applies the character-level
 * ordering and Arabic shaping itself for a single homogeneous run.
 */
export declare function orderLinePieces<T extends {
    text: string;
}>(items: T[], base: "ltr" | "rtl"): OrderedPiece<T>[];
/** Does this text contain any strong right-to-left character? */
export declare function hasRtl(text: string): boolean;
