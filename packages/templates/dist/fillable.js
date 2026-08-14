"use strict";
// Fillable fields. A template author marks nodes as editable
// placeholders with hints and constraints; downstream consumers (and bulk
// create) fill them, validated against the constraints. A field whose
// node no longer exists is dropped with a warning (Section 9).
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFillableFields = extractFillableFields;
exports.validateFill = validateFill;
const schema_1 = require("@hc/schema");
function findNode(file, id) {
    let found = null;
    const visit = (n) => {
        if (found)
            return;
        if (n.id === id) {
            found = n;
            return;
        }
        for (const c of (0, schema_1.childrenOf)(n))
            visit(c);
        const rec = n;
        if (n.type === "mask" && rec.child)
            visit(rec.child);
        if (n.type === "boolean" && Array.isArray(rec.operands))
            for (const op of rec.operands)
                visit(op);
    };
    for (const page of file.pages)
        for (const root of page.children)
            visit(root);
    return found;
}
const KIND_FOR = {
    text: "text",
    image: "image",
    shape: "color",
    frame: "image",
};
/** Build fillable-field definitions for the given node specs (FR-10). */
function extractFillableFields(file, specs) {
    const fields = [];
    const dropped = [];
    for (const spec of specs) {
        const node = findNode(file, spec.nodeId);
        if (!node) {
            dropped.push(spec.nodeId);
            continue;
        }
        fields.push({
            nodeId: spec.nodeId,
            kind: KIND_FOR[node.type] ?? "text",
            label: spec.label,
            hint: spec.hint,
            constraints: spec.constraints,
        });
    }
    return { fields, dropped };
}
/** Validate a value against a fillable field's constraints (fill time, FR-10). */
function validateFill(field, value) {
    const c = field.constraints;
    if (c?.required && value.present === false)
        return { ok: false, reason: `${field.label} is required` };
    if (field.kind === "text" && c?.maxChars !== undefined && value.text !== undefined && value.text.length > c.maxChars) {
        return { ok: false, reason: `${field.label} exceeds ${c.maxChars} characters` };
    }
    if (field.kind === "image" && c?.aspect !== undefined && value.aspect !== undefined) {
        const tol = 0.02;
        if (Math.abs(value.aspect - c.aspect) > tol)
            return { ok: false, reason: `${field.label} aspect must be ~${c.aspect}` };
    }
    return { ok: true };
}
