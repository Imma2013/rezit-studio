import type { Color } from "@hc/schema";
import { type LayoutResult, type Size } from "./layout";
import type { AiDesignSpec } from "./spec";
import type { DeckTheme, DesignOutline, DesignType } from "./outline";
/** Per-page text the caller extracts from the current design (largest run first
 *  is not assumed; we pick the title by font size). */
export interface PageText {
    name?: string;
    texts: {
        text: string;
        fontSize: number;
    }[];
}
/** Derive an editable outline from an arbitrary current design: the largest text
 *  on each page becomes the title, the rest become points. */
export declare function deriveOutline(input: {
    title?: string;
    pages: PageText[];
}): DesignOutline;
/** Re-shape an outline for a different design type, preserving content. */
export declare function switchOutline(outline: DesignOutline, to: DesignType): DesignOutline;
/** AI Magic Resize re-layout: recompose a spec at a new size (layoutDesign is
 *  size-aware, so this re-flows margins/type-scale/stack rather than scaling). */
export declare function recomposeSpec(spec: AiDesignSpec, size: Size): LayoutResult;
declare const CHART_TYPES: readonly ["bar", "line", "area", "pie", "donut", "scatter", "radar"];
export type StudioChartType = (typeof CHART_TYPES)[number];
export interface ChartSpec {
    chartType: StudioChartType;
    categories: string[];
    series: {
        name: string;
        values: number[];
    }[];
}
export declare class ChartSpecError extends Error {
}
/** Validate a parsed model chart spec into a ChartSpec. Pads/truncates each
 *  series to the category count so the chart model stays well-formed. */
export declare function normalizeChartSpec(parsed: unknown): ChartSpec;
export declare const chartSpecJsonSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["chartType", "categories", "series"];
    readonly properties: {
        readonly chartType: {
            readonly type: "string";
            readonly enum: readonly ["bar", "line", "area", "pie", "donut", "scatter", "radar"];
        };
        readonly categories: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly series: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "values"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly values: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "number";
                        };
                    };
                };
            };
        };
    };
};
/** System prompt asking the model to turn a data description into a ChartSpec. */
export declare function chartSystemPrompt(): string;
/** Turn an extracted palette (e.g. from a reference image) into a coherent deck
 *  theme: the darkest vivid color anchors a gradient toward a second hue. */
export declare function paletteTheme(colors: Color[], kicker?: string): DeckTheme;
export {};
