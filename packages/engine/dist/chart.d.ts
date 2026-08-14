export interface ChartSeriesLike {
    name: string;
    values: number[];
}
/** Inset plot rectangle inside a chart node, leaving room for chrome. */
export interface PlotRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * Linear value scale from a data domain `[0, max]` to a pixel extent. The
 * domain always starts at 0 so bars/areas have a stable baseline. `max` is the
 * largest value across all series (>= 0); a degenerate all-zero domain maps to
 * a flat baseline rather than dividing by zero.
 */
export declare function valueScale(values: number[][], pixels: number): (v: number) => number;
/** The maximum value across every series (>= 0), used to size axes/scales. */
export declare function seriesMax(series: ChartSeriesLike[]): number;
/** The number of category slots: the larger of the category count and the
 *  longest series, so a chart still lays out when categories are sparse. */
export declare function categoryCount(categories: string[], series: ChartSeriesLike[]): number;
/**
 * Per-bar geometry for a grouped (side-by-side) bar chart. Returns the x offset
 * and width for the bar of series `seriesIndex` within category slot `catIndex`.
 * Bars fill `fillFraction` of each category slot, split evenly across series.
 */
export declare function groupedBarLayout(plotWidth: number, catCount: number, seriesCount: number, catIndex: number, seriesIndex: number, fillFraction?: number): {
    x: number;
    width: number;
};
/**
 * Cumulative stacked total below series `seriesIndex` at category `catIndex`,
 * used to offset each stacked segment from the running baseline.
 */
export declare function stackedBase(series: ChartSeriesLike[], catIndex: number, seriesIndex: number): number;
/** Stacked total across all series at a category, to scale the y axis. */
export declare function stackedMax(series: ChartSeriesLike[], catCount: number): number;
/**
 * Point on a radar/spider axis. `axisIndex` of `axisCount` is placed evenly
 * around a circle starting at the top (12 o'clock); the radius is the value's
 * fraction of `maxValue` times `radius`.
 */
export declare function radarPoint(cx: number, cy: number, radius: number, axisIndex: number, axisCount: number, value: number, maxValue: number): {
    x: number;
    y: number;
};
/** "Nice" axis tick count for a value domain; clamps to a small range so labels
 *  stay legible. Pure, no canvas needed. */
export declare function tickCount(pixels: number): number;
