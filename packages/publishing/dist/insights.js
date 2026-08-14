"use strict";
// Published-post insights aggregation (FR-14). Pure summation; the platform
// fetch/upsert layer is the backend's responsibility.
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateInsights = aggregateInsights;
exports.engagementRate = engagementRate;
const METRIC_KEYS = [
    "impressions",
    "reach",
    "likes",
    "comments",
    "shares",
    "saves",
    "clicks",
];
function zero() {
    return { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 };
}
function addInto(acc, row) {
    for (const k of METRIC_KEYS) {
        acc[k] += row[k] ?? 0;
    }
}
/**
 * Aggregate insight rows into overall totals, per-platform totals, and
 * per-design totals. Missing metrics count as zero.
 */
function aggregateInsights(rows) {
    const totals = zero();
    const perPlatform = {};
    const perDesign = {};
    for (const row of rows) {
        addInto(totals, row);
        const p = row.platform;
        (perPlatform[p] ?? (perPlatform[p] = zero()));
        addInto(perPlatform[p], row);
        const designKey = row.designId ?? row.postId;
        (perDesign[designKey] ?? (perDesign[designKey] = zero()));
        addInto(perDesign[designKey], row);
    }
    return { totals, perPlatform, perDesign };
}
/**
 * Engagement rate for a single row: (likes + comments + shares + saves) divided
 * by reach (falling back to impressions if reach is absent). Returns 0 when
 * there is no denominator.
 */
function engagementRate(row) {
    const engagements = (row.likes ?? 0) + (row.comments ?? 0) + (row.shares ?? 0) + (row.saves ?? 0);
    const denom = row.reach ?? row.impressions ?? 0;
    if (denom <= 0)
        return 0;
    return engagements / denom;
}
