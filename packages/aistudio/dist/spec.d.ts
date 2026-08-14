/** A layout intent the engine arranges blocks into. */
export type DesignLayout = "centered" | "left" | "title-top" | "split";
export declare const DESIGN_LAYOUTS: DesignLayout[];
/** The role of a content block; drives the type scale and styling. */
export type BlockRole = "eyebrow" | "heading" | "subheading" | "body" | "accent";
export declare const BLOCK_ROLES: BlockRole[];
export interface DesignBlock {
    role: BlockRole;
    /** Required for text roles; ignored for "accent" (a decorative bar). */
    text?: string;
    /** Optional hex color hint; the quality pass overrides it if contrast is poor. */
    color?: string;
}
export interface DesignBackground {
    kind: "solid" | "gradient";
    color?: string;
    color2?: string;
    angle?: number;
}
/** Brand fonts for generated text, by role. Falls back to "system" (FR-17). */
export interface DesignFonts {
    heading?: string;
    body?: string;
}
export interface AiDesignSpec {
    layout: DesignLayout;
    background: DesignBackground;
    blocks: DesignBlock[];
    /** Reading direction; drives alignment and anchoring. Defaults to "ltr". */
    dir?: "ltr" | "rtl";
    /** Brand font families to use for headings/body (FR-17). */
    fonts?: DesignFonts;
}
export declare class DesignSpecError extends Error {
}
/** Validate + normalize a parsed model value into an AiDesignSpec. Drops unusable
 *  blocks, defaults safe values, and throws DesignSpecError when nothing usable
 *  remains (the caller surfaces a friendly retry message). */
export declare function normalizeDesignSpec(parsed: unknown): AiDesignSpec;
/** JSON Schema for AiDesignSpec - embedded in the generation prompt and ready to
 *  drive provider structured-output / tool-calling once the backend exposes it. */
export declare const designSpecJsonSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["layout", "background", "blocks"];
    readonly properties: {
        readonly layout: {
            readonly type: "string";
            readonly enum: DesignLayout[];
        };
        readonly background: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: readonly ["solid", "gradient"];
                };
                readonly color: {
                    readonly type: "string";
                    readonly description: "hex, e.g. #1a2b3c";
                };
                readonly color2: {
                    readonly type: "string";
                    readonly description: "hex; gradient end";
                };
                readonly angle: {
                    readonly type: "number";
                    readonly description: "gradient angle in degrees";
                };
            };
        };
        readonly blocks: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["role"];
                readonly properties: {
                    readonly role: {
                        readonly type: "string";
                        readonly enum: BlockRole[];
                    };
                    readonly text: {
                        readonly type: "string";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly description: "hex";
                    };
                };
            };
        };
    };
};
