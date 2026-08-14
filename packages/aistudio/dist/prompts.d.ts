import { type DesignType } from "./outline";
/** System prompt asking the model for a DesignOutline (titles + points + roles),
 *  never positions or styling. The client validates with normalizeOutline. */
export declare function outlineSystemPrompt(designType: DesignType, brandClause: string, pageCount?: number): string;
/** User message grounding the outline request with the brief. */
export declare function outlineUserPrompt(prompt: string, designType: DesignType): string;
/** Ground an image-generation prompt in the design context so generated media is
 *  style-consistent with the design (FR-23): palette, aspect, and an optional
 *  style/mood phrase. Pure string composition, provider-agnostic. */
export declare function groundImagePrompt(prompt: string, ctx: {
    palette?: string[];
    aspect?: "square" | "portrait" | "landscape";
    style?: string;
}): string;
