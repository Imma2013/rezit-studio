"use strict";
// QR mini-app node model. The QR node stores its bound
// value and style plus the precomputed scannable module matrix (the engine's
// drawQr reads node.modules). The matrix regenerates whenever the bound value or
// EC level changes, via the bit-matrix encoder (Reed-Solomon + masking).
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQrNode = createQrNode;
exports.qrValue = qrValue;
exports.rebindQrValue = rebindQrValue;
const schema_1 = require("@hc/schema");
const qrmatrix_1 = require("./qrmatrix");
const BLACK = { srgb: { r: 0, g: 0, b: 0, a: 1 } };
const WHITE = { srgb: { r: 1, g: 1, b: 1, a: 1 } };
/** Create an editable QR node bound to `value` (FR-10). */
function createQrNode(value, opts = {}, id = "qr") {
    const s = opts.size ?? 240;
    const ecLevel = opts.ecLevel ?? "M";
    return (0, schema_1.createNode)("qr", {
        id,
        size: { width: s, height: s },
        value,
        ecLevel,
        modules: (0, qrmatrix_1.encodeQrMatrix)(value, ecLevel),
        foreground: opts.foreground ?? BLACK,
        background: opts.background ?? WHITE,
        ...(opts.logoAssetId ? { logoAssetId: opts.logoAssetId } : {}),
    });
}
/** The value a QR node encodes (its live binding). */
function qrValue(node) {
    return node.value;
}
/**
 * Rebind a QR node to a new value (FR-10: the code regenerates when the bound
 * value changes). Returns a new node; the matrix is re-derived at render time.
 */
function rebindQrValue(node, value) {
    if (node.type !== "qr")
        throw new Error("rebindQrValue: not a qr node");
    const ecLevel = node.ecLevel ?? "M";
    return { ...node, value, modules: (0, qrmatrix_1.encodeQrMatrix)(value, ecLevel) };
}
