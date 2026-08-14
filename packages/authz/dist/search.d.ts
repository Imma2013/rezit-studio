import type { HomeItem } from "./types";
export interface SearchQuery {
    q?: string;
    type?: HomeItem["kind"] | HomeItem["kind"][];
}
/**
 * Filter by type facet and (when a query is given) text relevance, then rank by
 * relevance, then starred, then most-recently-updated.
 */
export declare function searchHome(items: HomeItem[], query?: SearchQuery): HomeItem[];
