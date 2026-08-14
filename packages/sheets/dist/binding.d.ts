import { type CellValue } from "@hc/formula";
import type { Grid, ChartBinding } from "./model";
export interface ResolvedBinding {
    categories: string[];
    series: {
        name: string;
        values: number[];
    }[];
}
/**
 * Resolve a ChartBinding into chart-ready data.
 *
 * orientation "columns": each column is a series; the first row holds series
 * names and the first column holds category labels.
 * orientation "rows": each row is a series; the first column holds series
 * names and the first row holds category labels.
 */
export declare function resolveBinding(grid: Grid, binding: ChartBinding, computed?: Record<string, CellValue>): ResolvedBinding;
