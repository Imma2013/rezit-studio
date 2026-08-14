"use strict";
// @hc/schema - the open design file format.
//
// The contract every feature extends. Adding a node type or property means
// extending the schema here and shipping a forward migration (see migrate.ts),
// so opening an older file always succeeds.
//
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA_VERSION = void 0;
// Types, zod schemas, and format constants.
__exportStar(require("./schema"), exports);
// Validation gate (JSON-pointer errors), used by persistence/import/API.
__exportStar(require("./validate"), exports);
// Forward-only migration chain.
__exportStar(require("./migrate"), exports);
// Default-instance factory and blank-design helper.
__exportStar(require("./factory"), exports);
// Generic scene-graph traversal.
__exportStar(require("./visitor"), exports);
// Forward-compatibility helpers for unknown/newer node types.
__exportStar(require("./unknown-nodes"), exports);
// Published JSON Schema (draft 2020-12) generation.
__exportStar(require("./json-schema"), exports);
// Yjs bridge (edit-time CRDT <-> serialized file).
__exportStar(require("./yjs"), exports);
__exportStar(require("./theme"), exports);
__exportStar(require("./a11y"), exports);
__exportStar(require("./sections"), exports);
/**
 * Back-compat alias for the schema version constant. Prefer
 * `CURRENT_SCHEMA_VERSION`.
 * @deprecated use CURRENT_SCHEMA_VERSION
 */
var schema_1 = require("./schema");
Object.defineProperty(exports, "SCHEMA_VERSION", { enumerable: true, get: function () { return schema_1.CURRENT_SCHEMA_VERSION; } });
