import type { AiDesignSpec, DesignBackground } from "./spec";
/** What kind of multi-page artifact we are generating. Drives length + arc. */
export type DesignType = "deck" | "doc" | "social-set" | "poster";
export declare const DESIGN_TYPES: DesignType[];
/** The narrative/visual role of a page; maps to a layout + emphasis. */
export type VisualRole = "cover" | "agenda" | "content" | "comparison" | "quote" | "data" | "closing";
export declare const VISUAL_ROLES: VisualRole[];
export interface OutlineItem {
    id: string;
    title: string;
    points: string[];
    visualRole: VisualRole;
}
export interface DesignOutline {
    title: string;
    /** A short theme phrase (mood/topic) used to ground per-page styling. */
    theme: string;
    pages: OutlineItem[];
}
/** A coherent visual system shared by every page in one generated design. */
export interface DeckTheme {
    background: DesignBackground;
    /** Optional eyebrow/kicker shown on content pages (e.g. the deck title). */
    kicker?: string;
    /** Brand fonts applied to every page (FR-17). */
    fontHeading?: string;
    fontBody?: string;
}
export interface GenerationRequest {
    designType: DesignType;
    prompt: string;
    /** Brand palette hexes to ground styling (optional). */
    brandPalette?: string[];
    /** How many pages to aim for; the model may adjust within reason. */
    pageCount?: number;
}
export declare class OutlineError extends Error {
}
/** Validate + normalize a parsed model value into a DesignOutline. Drops empty
 *  pages, defaults roles, and throws when nothing usable remains. */
export declare function normalizeOutline(parsed: unknown): DesignOutline;
/** JSON Schema for a DesignOutline, embedded in the generation prompt. */
export declare const outlineJsonSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["title", "pages"];
    readonly properties: {
        readonly title: {
            readonly type: "string";
        };
        readonly theme: {
            readonly type: "string";
            readonly description: "short mood/topic phrase";
        };
        readonly pages: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["title", "visualRole"];
                readonly properties: {
                    readonly title: {
                        readonly type: "string";
                    };
                    readonly points: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly visualRole: {
                        readonly type: "string";
                        readonly enum: VisualRole[];
                    };
                };
            };
        };
    };
};
/** Expand one outline item into a laid-out-ready AiDesignSpec, themed
 *  consistently with the rest of the deck. Pure + deterministic. `index` lets
 *  consecutive content pages alternate composition for visual rhythm (FR-3:
 *  template-grounded, well-formed structure, not one rigid layout). */
export declare function outlineItemToSpec(item: OutlineItem, theme: DeckTheme, opts?: {
    dir?: "ltr" | "rtl";
    index?: number;
}): AiDesignSpec;
