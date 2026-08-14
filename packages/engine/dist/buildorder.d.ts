import type { AnimationStartMode, Page } from "@hc/schema";
/** One animated element's slot on the page timeline. */
export interface BuildStep {
    nodeId: string;
    nodeName?: string;
    /** Position among animated siblings, 1-based (what the UI numbers). */
    order: number;
    /** Index of this node in the page's `children`, so a caller can reorder it. */
    childIndex: number;
    preset: string;
    startMode: AnimationStartMode;
    /** Absolute start on the page timeline, in ms. */
    startMs: number;
    durationMs: number;
    /** `startMs + durationMs`. */
    endMs: number;
}
/** The whole page timeline: every animated element, in build order. */
export interface BuildPlan {
    steps: BuildStep[];
    /** When the last entrance finishes, in ms (0 when nothing animates). */
    totalMs: number;
}
/**
 * Project a page's entrance animations onto one ordered timeline.
 *
 * Order is the page's child order restricted to animated nodes, which is what
 * `sequenceStarts` walks, so "step 2" here is the same element playback treats
 * as second. Nodes with no entrance are omitted; a node whose start cannot be
 * resolved (it has an entrance but `sequenceStarts` skipped it) is defensively
 * skipped too, rather than being drawn at a wrong time.
 */
export declare function planBuildOrder(page: Page): BuildPlan;
/**
 * The child index a build step must move to so it lands at build position
 * `toOrder` (1-based) among the animated siblings.
 *
 * Reordering the build strip reorders the page's children, because the child
 * order IS the build order. Only animated siblings shift; a non-animated node
 * sitting between them keeps its place, which is why this maps through the
 * animated subset rather than assuming the two orders are the same.
 *
 * Returns null when the move is a no-op or out of range.
 */
export declare function childIndexForBuildOrder(page: Page, fromOrder: number, toOrder: number): number | null;
/** Human label for a start mode, shared by the strip and any tooltip. */
export declare function startModeLabel(mode: AnimationStartMode): string;
