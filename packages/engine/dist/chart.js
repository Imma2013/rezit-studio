"use strict";
// Pure chart layout/scale helpers. Framework-agnostic and side-effect
// free so they can be unit-tested without a canvas and reused by the GPU path.
// The Canvas2D renderer in render2d.ts consumes these to lay out bars, lines,
// stacked/grouped series, scatter, radar, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueScale = valueScale;
exports.seriesMax = seriesMax;
exports.categoryCount = categoryCount;
exports.groupedBarLayout = groupedBarLayout;
exports.stackedBase = stackedBase;
exports.stackedMax = stackedMax;
exports.radarPoint = radarPoint;
exports.tickCount = tickCount;
/**
 * Linear value scale from a data domain `[0, max]` to a pixel extent. The
 * domain always starts at 0 so bars/areas have a stable baseline. `max` is the
 * largest value across all series (>= 0); a degenerate all-zero domain maps to
 * a flat baseline rather than dividing by zero.
 */
function valueScale(values, pixels) {
    let max = 0;
    for (const s of values)
        for (const v of s)
            if (v > max)
                max = v;
    const domain = max || 1;
    return (v) => (Math.max(0, v) / domain) * pixels;
}
/** The maximum value across every series (>= 0), used to size axes/scales. */
function seriesMax(series) {
    let max = 0;
    for (const s of series)
        for (const v of s.values)
            if (v > max)
                max = v;
    return max;
}
/** The number of category slots: the larger of the category count and the
 *  longest series, so a chart still lays out when categories are sparse. */
function categoryCount(categories, series) {
    return Math.max(categories.length, ...series.map((s) => s.values.length), 0);
}
/**
 * Per-bar geometry for a grouped (side-by-side) bar chart. Returns the x offset
 * and width for the bar of series `seriesIndex` within category slot `catIndex`.
 * Bars fill `fillFraction` of each category slot, split evenly across series.
 */
function groupedBarLayout(plotWidth, catCount, seriesCount, catIndex, seriesIndex, fillFraction = 0.8) {
    const slot = catCount > 0 ? plotWidth / catCount : plotWidth;
    const groupW = slot * fillFraction;
    const pad = (slot - groupW) / 2;
    const barW = seriesCount > 0 ? groupW / seriesCount : groupW;
    return { x: catIndex * slot + pad + seriesIndex * barW, width: barW };
}
/**
 * Cumulative stacked total below series `seriesIndex` at category `catIndex`,
 * used to offset each stacked segment from the running baseline.
 */
function stackedBase(series, catIndex, seriesIndex) {
    let base = 0;
    for (let j = 0; j < seriesIndex; j++)
        base += Math.max(0, series[j].values[catIndex] ?? 0);
    return base;
}
/** Stacked total across all series at a category, to scale the y axis. */
function stackedMax(series, catCount) {
    let max = 0;
    for (let i = 0; i < catCount; i++) {
        let sum = 0;
        for (const s of series)
            sum += Math.max(0, s.values[i] ?? 0);
        if (sum > max)
            max = sum;
    }
    return max;
}
/**
 * Point on a radar/spider axis. `axisIndex` of `axisCount` is placed evenly
 * around a circle starting at the top (12 o'clock); the radius is the value's
 * fraction of `maxValue` times `radius`.
 */
function radarPoint(cx, cy, radius, axisIndex, axisCount, value, maxValue) {
    const angle = -Math.PI / 2 + (axisIndex / Math.max(1, axisCount)) * Math.PI * 2;
    const r = (Math.max(0, value) / (maxValue || 1)) * radius;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}
/** "Nice" axis tick count for a value domain; clamps to a small range so labels
 *  stay legible. Pure, no canvas needed. */
function tickCount(pixels) {
    return Math.max(2, Math.min(8, Math.round(pixels / 48)));
}
