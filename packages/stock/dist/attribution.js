"use strict";
// Attribution compilation. Credits are always derived from
// the design's node provenance, never stored stale: removing the last node that
// used an attribution-required asset drops its entry; re-adding restores it.
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeProvenance = nodeProvenance;
exports.compileAttribution = compileAttribution;
exports.attributionText = attributionText;
const schema_1 = require("@hc/schema");
const types_1 = require("./types");
function visit(node, fn) {
    fn(node);
    for (const c of (0, schema_1.childrenOf)(node))
        visit(c, fn);
    const rec = node;
    if (node.type === "mask" && rec.child)
        visit(rec.child, fn);
    if (node.type === "boolean" && Array.isArray(rec.operands)) {
        for (const op of rec.operands)
            visit(op, fn);
    }
}
/** Read provenance stamped on a node (by {@link withProvenance}), if any. */
function nodeProvenance(node) {
    const data = node.data;
    return data?.[types_1.PROVENANCE_KEY];
}
/**
 * Compile the required attribution credits for a design (FR-14). Groups by
 * source asset, lists the contributing node ids, and includes only
 * attribution-required stock provenance. Deterministically ordered by assetId.
 */
function compileAttribution(file) {
    const byAsset = new Map();
    for (const page of file.pages) {
        for (const root of page.children) {
            visit(root, (node) => {
                const prov = nodeProvenance(node);
                if (!prov || prov.origin !== "stock" || !prov.stockAssetId)
                    return;
                const lic = prov.license;
                if (!lic?.attributionRequired)
                    return;
                const key = prov.stockAssetId;
                const existing = byAsset.get(key);
                if (existing) {
                    if (!existing.nodeIds.includes(node.id))
                        existing.nodeIds.push(node.id);
                }
                else {
                    byAsset.set(key, {
                        assetId: key,
                        source: "stock",
                        attributionText: lic.attributionText ?? `Asset ${key}`,
                        attributionUrl: lic.attributionUrl,
                        nodeIds: [node.id],
                    });
                }
            });
        }
    }
    return [...byAsset.values()].sort((a, b) => a.assetId.localeCompare(b.assetId));
}
/** Render compiled credits as plain text lines (for copy or export metadata). */
function attributionText(entries) {
    return entries.map((e) => (e.attributionUrl ? `${e.attributionText} (${e.attributionUrl})` : e.attributionText)).join("\n");
}
