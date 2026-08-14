"use strict";
// Marketplace ranking + faceting: pure sort/aggregate helpers for the
// template marketplace surface. searchTemplates handles text relevance + scoped
// filtering; this adds the marketplace-specific ordering (popular / recent /
// relevance) over PUBLISHED templates and the facet counts the filter sidebar
// needs. No I/O; the catalog/CDN and preview rendering remain backend concerns.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPublished = isPublished;
exports.rankMarketplace = rankMarketplace;
exports.templateFacets = templateFacets;
/** Only templates published to the marketplace are eligible to be listed. */
function isPublished(t) {
    return t.marketplace?.status === "published";
}
function usage(t) {
    return t.marketplace?.usageCount ?? 0;
}
/** Rank published templates for the marketplace. "popular" orders by usage,
 *  "recent" by last update, "relevance" preserves the caller's (already
 *  relevance-sorted) order. Ties break by usage then title for stability. */
function rankMarketplace(templates, sort = "popular") {
    const listed = templates.filter(isPublished);
    if (sort === "relevance")
        return listed;
    const byTitle = (a, b) => a.title.localeCompare(b.title);
    if (sort === "recent") {
        return [...listed].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || usage(b) - usage(a) || byTitle(a, b));
    }
    return [...listed].sort((a, b) => usage(b) - usage(a) || b.updatedAt.localeCompare(a.updatedAt) || byTitle(a, b));
}
function countField(templates, pick) {
    const counts = new Map();
    for (const t of templates)
        for (const v of pick(t))
            counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
/** Aggregate category / tag / style facets (with counts) for the filter sidebar,
 *  over the published templates only. */
function templateFacets(templates) {
    const listed = templates.filter(isPublished);
    return {
        categories: countField(listed, (t) => t.categories),
        tags: countField(listed, (t) => t.tags),
        styles: countField(listed, (t) => t.style?.styleTags ?? []),
    };
}
