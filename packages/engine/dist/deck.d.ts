import type { DesignFile, PageTransition } from "@hc/schema";
/** How long a slide holds once its animations have finished. */
export declare const DEFAULT_SLIDE_HOLD_MS = 2000;
export interface DeckPlanOptions {
    /** Frames per second to sample at. */
    fps?: number;
    /** Extra hold after a slide's animations finish, in ms. */
    holdMs?: number;
    /** Cap on total frames, so a long deck cannot exhaust memory. */
    maxFrames?: number;
    /** Honor `prefers-reduced-motion`: skip transitions entirely (FR-16/FR-22). */
    reducedMotion?: boolean;
    /** Restrict the playthrough to these page indices, in file order (hidden
     *  pages are still skipped). Omit to plan every visible page. */
    pageIndices?: number[];
}
/** A single slide frame: draw `pageIndex` posed at `tMs`. */
export interface SlideFrame {
    kind: "slide";
    pageIndex: number;
    /** Animation time within the slide. */
    tMs: number;
    delayMs: number;
}
/** A deck transition frame: composite `fromIndex` -> `toIndex` at eased `progress`.
 *  The leaving slide is fully settled; the arriving slide is `toTMs` into its
 *  own entrance, matching present mode. */
export interface DeckTransitionFrame {
    kind: "transition";
    fromIndex: number;
    toIndex: number;
    transition: PageTransition;
    /** Eased progress, 0..1, ready to hand to `renderTransition`. */
    progress: number;
    /** Arriving slide's animation time. */
    toTMs: number;
    delayMs: number;
}
export type DeckFrame = SlideFrame | DeckTransitionFrame;
/** Slides that actually present (a hidden page is skipped, as in present mode). */
export declare function visibleSlideIndices(file: DesignFile): number[];
/** The time a slide occupies on its own: its animation window plus a hold. */
export declare function slideDurationMs(file: DesignFile, pageIndex: number, holdMs?: number): number;
/**
 * Plan every frame of a deck playthrough, in order.
 *
 * Frames are emitted at a fixed `fps`, so `delayMs` is uniform and any encoder
 * (APNG, GIF, an image2pipe stream) can consume the list directly. Transitions
 * are dropped under `reducedMotion`, matching the reduced-motion present path.
 * The frame count is bounded by `maxFrames`; truncation is silent by design so
 * an export never hangs, and callers that care can compare lengths.
 */
export declare function planDeckFrames(file: DesignFile, opts?: DeckPlanOptions): DeckFrame[];
/** Total wall-clock duration of a plan, in ms. */
export declare function planDurationMs(frames: DeckFrame[]): number;
