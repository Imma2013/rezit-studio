import type { Template } from "./types";
export type MarketplaceSort = "popular" | "recent" | "relevance";
/** Only templates published to the marketplace are eligible to be listed. */
export declare function isPublished(t: Template): boolean;
/** Rank published templates for the marketplace. "popular" orders by usage,
 *  "recent" by last update, "relevance" preserves the caller's (already
 *  relevance-sorted) order. Ties break by usage then title for stability. */
export declare function rankMarketplace(templates: Template[], sort?: MarketplaceSort): Template[];
export interface Facet {
    value: string;
    count: number;
}
export interface TemplateFacets {
    categories: Facet[];
    tags: Facet[];
    styles: Facet[];
}
/** Aggregate category / tag / style facets (with counts) for the filter sidebar,
 *  over the published templates only. */
export declare function templateFacets(templates: Template[]): TemplateFacets;
