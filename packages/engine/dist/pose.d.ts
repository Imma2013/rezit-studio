import type { DesignFile, Node } from "@hc/schema";
/** Reveal a text node's content for a typewriter/word-wipe entrance at local time
 *  `tMs` (no-op for other presets / non-text / after the clip ends). Mutates the
 *  node in place, so callers pass a clone or restore afterward. Shared by the
 *  poser, the editor "Play" preview, and present mode so all three match. */
export declare function revealEntranceText(node: Node, clip: {
    preset: string;
    durationMs: number;
    delayMs: number;
    easing: import("@hc/schema").Easing;
    bezier?: [number, number, number, number];
}, tMs: number): void;
/** Effective entrance start (ms) per node id, resolving cross-element sequencing
 *  ("with previous" / "after previous") against sibling order. Only entrances
 *  participate; nodes without one are skipped. Exported so the live preview and
 *  present mode resolve sequencing identically to the poser/export. */
export declare function sequenceStarts(nodes: Node[]): Map<string, number>;
/** The total animated duration of a page in ms (max over its nodes' entrance +
 *  emphasis/custom windows), for choosing an export length. Image motion loops,
 *  so it does not extend the total. */
export declare function pageAnimationDuration(file: DesignFile, pageIndex?: number): number;
/** Return a clone of `file` with page `pageIndex` posed at time `tMs`. */
export declare function poseDesignAt(file: DesignFile, pageIndex: number, tMs: number): DesignFile;
