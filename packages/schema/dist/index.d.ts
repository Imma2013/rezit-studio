export * from "./schema";
export * from "./validate";
export * from "./migrate";
export * from "./factory";
export * from "./visitor";
export * from "./unknown-nodes";
export * from "./json-schema";
export * from "./yjs";
export * from "./theme";
export * from "./a11y";
export * from "./sections";
/**
 * Back-compat alias for the schema version constant. Prefer
 * `CURRENT_SCHEMA_VERSION`.
 * @deprecated use CURRENT_SCHEMA_VERSION
 */
export { CURRENT_SCHEMA_VERSION as SCHEMA_VERSION } from "./schema";
