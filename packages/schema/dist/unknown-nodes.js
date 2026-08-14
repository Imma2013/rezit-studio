"use strict";
// Forward-compatibility helpers for node types written by a newer client
// (FR-3, FR-12, Section 5). Unknown types are never dropped: they are wrapped
// into an `UnknownNode` that preserves the original verbatim in `raw`, so an
// older client can render a placeholder and re-serialize the node identically.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnknownNode = isUnknownNode;
exports.wrapUnknownNode = wrapUnknownNode;
exports.unwrapUnknownNode = unwrapUnknownNode;
const schema_1 = require("./schema");
/** True when a node's `type` has no concrete schema in this client. */
function isUnknownNode(node) {
    return !(0, schema_1.isKnownNodeType)(node.type);
}
const BASE_KEYS = [
    "id", "type", "transform", "size", "opacity", "blendMode",
    "effects", "constraints", "locked", "hidden", "name", "link", "animations", "data",
];
/**
 * Wrap a raw node of an unrecognized type into an `UnknownNode`: known base
 * fields are surfaced for generic operations (select/move/lock/reorder) while
 * the complete original is preserved in `raw` for lossless round-trips.
 * Idempotent: a node that already carries `raw` is returned unchanged.
 */
function wrapUnknownNode(node) {
    if ("raw" in node && node.raw && typeof node.raw === "object") {
        return node;
    }
    const wrapped = { raw: { ...node } };
    for (const key of BASE_KEYS) {
        if (node[key] !== undefined)
            wrapped[key] = node[key];
    }
    return wrapped;
}
/** Recover the original node object preserved inside an `UnknownNode`. */
function unwrapUnknownNode(node) {
    return node.raw;
}
