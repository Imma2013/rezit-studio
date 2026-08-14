"use strict";
// JSON Schema (draft 2020-12) generation from the zod schema (FR-1). Generated
// from the same source as the runtime validator and the TypeScript types, so
// the published schema cannot drift from them (AC-7).
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESIGN_SCHEMA_ID = exports.DESIGN_MEDIA_TYPE = void 0;
exports.getJsonSchema = getJsonSchema;
const zod_1 = require("zod");
const schema_1 = require("./schema");
/** Media type for the open design file format. */
exports.DESIGN_MEDIA_TYPE = "application/vnd.hycanvas.design+json";
/** Stable `$id` for the published schema document. */
exports.DESIGN_SCHEMA_ID = "https://hycanvas.dev/schema/design.schema.json";
/**
 * Build the JSON Schema for a `DesignFile` as draft 2020-12. Refinements that
 * have no JSON Schema representation (for example the UnknownNode "not a known
 * type" guard) are widened to `any` rather than throwing.
 */
function getJsonSchema() {
    const schema = zod_1.z.toJSONSchema(schema_1.DesignFileSchema, {
        target: "draft-2020-12",
        unrepresentable: "any",
        // Emit a subschema used by more than one parent ONCE, under $defs, and
        // reference it. The default inlines every reuse, and `nodeBaseFields` is
        // spread into all ~54 node types, so every shared structure was duplicated
        // 54 times: the published schema was 640 KB with five $refs in it, and the
        // resulting validator was deep enough that Ajv overflowed its stack on an
        // ordinary fixture. The duplication is a property of `nodeBaseFields` being
        // spread everywhere, so it is worth fixing on its own account.
        reused: "ref",
    });
    return {
        $id: exports.DESIGN_SCHEMA_ID,
        title: "HyCanvas Design File",
        ...schema,
    };
}
