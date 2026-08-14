import type { Node } from "@hc/schema";
export type SearchKind = "sticky" | "text" | "connector" | "frame";
export interface SearchMatch {
    nodeId: string;
    kind: SearchKind;
    /** The node's full searchable text (the UI snippets/highlights from this). */
    text: string;
}
/** The concatenated, human-visible text of a node, or "" if it has none. */
export declare function nodeSearchText(node: Node): string;
/**
 * Find nodes whose searchable text contains `query` (case-insensitive),
 * in document order, descending into frames/groups. A blank query yields no
 * matches. Each node appears at most once.
 */
export declare function searchNodes(nodes: Node[], query: string): SearchMatch[];
