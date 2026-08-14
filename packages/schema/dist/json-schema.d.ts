/** Media type for the open design file format. */
export declare const DESIGN_MEDIA_TYPE = "application/vnd.hycanvas.design+json";
/** Stable `$id` for the published schema document. */
export declare const DESIGN_SCHEMA_ID = "https://hycanvas.dev/schema/design.schema.json";
/**
 * Build the JSON Schema for a `DesignFile` as draft 2020-12. Refinements that
 * have no JSON Schema representation (for example the UnknownNode "not a known
 * type" guard) are widened to `any` rather than throwing.
 */
export declare function getJsonSchema(): Record<string, unknown>;
