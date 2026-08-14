export interface MenuItem {
    id: string;
    label: string;
    keywords?: string[];
    category?: string;
    /** Precomputed for the active context; disabled items rank lower (FR-11). */
    enabled?: boolean;
    /** Bound shortcut to display, if any. */
    shortcut?: string;
}
export interface SearchOptions {
    recents?: string[];
    frequency?: Record<string, number>;
    limit?: number;
}
export interface SearchResult {
    item: MenuItem;
    score: number;
}
/**
 * Subsequence fuzzy score of `query` against `text`. Returns null when `query`
 * is not a subsequence of `text`. Higher is better: consecutive matches, matches
 * at word starts, and an earlier first match all score higher.
 */
export declare function fuzzyScore(query: string, text: string): number | null;
/**
 * Rank items for the palette. With an empty query, returns items ordered by
 * recency/frequency (the "Recent" section first), then the rest. Disabled items
 * are included but penalized so they sort to the bottom.
 */
export declare function search(query: string, items: MenuItem[], opts?: SearchOptions): SearchResult[];
