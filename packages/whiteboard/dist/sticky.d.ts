export interface StickyFitOpts {
    basePx?: number;
    minScale?: number;
    maxScale?: number;
}
/**
 * Find a fontScale so the (word-wrapped) text fits within width x height.
 * Monotonic in text length: more text yields a smaller-or-equal scale.
 *
 * Approach: for a candidate font size, estimate characters-per-line from the
 * usable width and required lines from the character count, then check the
 * total text height fits the usable height. Binary-search the largest fitting
 * size, then convert to a scale and clamp.
 */
export declare function fitStickyFontScale(text: string, width: number, height: number, opts?: StickyFitOpts): number;
