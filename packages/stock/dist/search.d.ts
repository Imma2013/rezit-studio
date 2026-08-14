import type { StockAsset, StockQuery } from "./types";
/** Whether any of the asset's dominant colors is within `maxDist` of `hex`. */
export declare function colorMatches(asset: StockAsset, hex: string, maxDist?: number): boolean;
/** Parse raw query-string-style filter params into a typed StockQuery (FR-2). */
export declare function filtersToQuery(params: Record<string, string | undefined>): StockQuery;
/** Colorfulness of the dominant palette: the widest channel spread (chroma)
 *  across the dominant colors, plus a small bonus per extra vivid color.
 *  Monochrome assets score 0. */
export declare function colorfulness(asset: StockAsset): number;
/** Whether an asset satisfies a query (no text-relevance gate beyond a match). */
export declare function stockMatches(asset: StockAsset, query: StockQuery): boolean;
/** Filter and rank a catalog slice for a query (FR-1, AC-1). Text queries rank
 *  by relevance; without text, browse order applies: photos/illustrations
 *  before icon packs, most colorful first within a kind. Deterministic (title
 *  tiebreak) so offset paging stays stable across requests. */
export declare function searchStock(assets: StockAsset[], query?: StockQuery): StockAsset[];
