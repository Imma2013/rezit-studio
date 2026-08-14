import { type DocBlock } from "./model";
export type BlockDiffType = "added" | "removed" | "unchanged" | "modified";
export interface InlineDiffSpan {
    text: string;
    op: "same" | "add" | "del";
}
export interface BlockDiffEntry {
    type: BlockDiffType;
    block: DocBlock;
    before?: DocBlock;
    inline?: InlineDiffSpan[];
}
/** Word-level LCS inline diff between two strings. */
export declare function inlineWordDiff(before: string, after: string): InlineDiffSpan[];
/**
 * Diff two block lists, matching by id. Blocks only in `b` are "added", only in
 * `a` are "removed", same id with differing content are "modified" (with an
 * inline word diff when both are text blocks), and identical blocks are
 * "unchanged". Result order follows `b` first (added/modified/unchanged in their
 * b positions), then removed blocks in their original `a` order.
 */
export declare function diffBlocks(a: DocBlock[], b: DocBlock[]): BlockDiffEntry[];
