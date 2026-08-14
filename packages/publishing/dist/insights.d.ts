import type { PostInsights } from "./types";
export interface InsightTotals {
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
}
export interface AggregatedInsights {
    totals: InsightTotals;
    perPlatform: Record<string, InsightTotals>;
    perDesign: Record<string, InsightTotals>;
}
/**
 * A row optionally carries a designId so insights can roll up per design. If
 * absent, the row's postId is used as the design grouping key.
 */
export interface InsightRow extends PostInsights {
    designId?: string;
}
/**
 * Aggregate insight rows into overall totals, per-platform totals, and
 * per-design totals. Missing metrics count as zero.
 */
export declare function aggregateInsights(rows: readonly InsightRow[]): AggregatedInsights;
/**
 * Engagement rate for a single row: (likes + comments + shares + saves) divided
 * by reach (falling back to impressions if reach is absent). Returns 0 when
 * there is no denominator.
 */
export declare function engagementRate(row: PostInsights): number;
