"use strict";
// Insertion: map a StockAsset to native scene-graph nodes.
// Media become media nodes plus an AssetRef pointing at the CDN sourceUrl;
// icons/illustrations/shapes with inline SVG become editable vector nodes;
// shapes/frames/grids map to their native node types. Provenance is recorded so
// attribution survives export (FR-14).
Object.defineProperty(exports, "__esModule", { value: true });
exports.withProvenance = withProvenance;
exports.stockToNodes = stockToNodes;
const schema_1 = require("@hc/schema");
const svg_1 = require("./svg");
const types_1 = require("./types");
function provenanceOf(asset) {
    return { origin: "stock", stockAssetId: asset.id, license: asset.license };
}
/** Stamp provenance onto a node under the agreed data key (serialized in-file). */
function withProvenance(node, prov) {
    const data = { ...node.data, [types_1.PROVENANCE_KEY]: prov };
    return { ...node, data };
}
const REF_KIND = {
    jpg: "image", png: "image", webp: "image", svg: "svg",
    mp4: "video", webm: "video", mp3: "audio", glb: "model3d", json: "lottie",
};
function mediaRef(asset) {
    return {
        id: asset.id,
        kind: REF_KIND[asset.format] ?? "image",
        url: asset.sourceUrl,
        mime: `application/${asset.format}`,
        width: asset.width,
        height: asset.height,
        durationMs: asset.durationMs,
        checksum: asset.id,
    };
}
function box(asset) {
    return { width: asset.width ?? 200, height: asset.height ?? 200 };
}
/**
 * Materialize a stock asset into editable nodes. Pure: returns the nodes,
 * an optional AssetRef to add to the design, and provenance. `idGen` lets tests
 * be deterministic.
 */
function stockToNodes(asset, idGen = (() => { let i = 0; return () => `ins-${++i}`; })()) {
    const prov = provenanceOf(asset);
    const size = box(asset);
    // Vector kinds with inline SVG become editable nodes.
    if (asset.svg && (asset.kind === "icon" || asset.kind === "illustration" || asset.kind === "shape")) {
        const { nodes, approximated } = (0, svg_1.svgToNodes)(asset.svg, idGen);
        return { nodes: nodes.map((n) => withProvenance(n, prov)), provenance: prov, approximated };
    }
    switch (asset.kind) {
        case "photo":
        case "background":
        case "sticker":
        case "illustration": {
            const ref = mediaRef(asset);
            const node = (0, schema_1.createNode)("image", {
                id: idGen(),
                size,
                source: { assetId: ref.id, naturalWidth: asset.width ?? 0, naturalHeight: asset.height ?? 0 },
            });
            return { nodes: [withProvenance(node, prov)], assetRef: ref, provenance: prov };
        }
        case "video": {
            const ref = mediaRef(asset);
            const node = (0, schema_1.createNode)("video", { id: idGen(), size, assetId: ref.id });
            return { nodes: [withProvenance(node, prov)], assetRef: ref, provenance: prov };
        }
        case "audio": {
            const ref = mediaRef(asset);
            const node = (0, schema_1.createNode)("audio", { id: idGen(), size, assetId: ref.id });
            return { nodes: [withProvenance(node, prov)], assetRef: ref, provenance: prov };
        }
        case "frame":
            return { nodes: [withProvenance((0, schema_1.createNode)("frame", { id: idGen(), size }), prov)], provenance: prov };
        case "grid":
            return { nodes: [withProvenance((0, schema_1.createNode)("grid", { id: idGen(), size }), prov)], provenance: prov };
        case "chart":
            return { nodes: [withProvenance((0, schema_1.createNode)("chart", { id: idGen(), size }), prov)], provenance: prov };
        case "shape":
        default: {
            const node = (0, schema_1.createNode)("shape", { id: idGen(), shape: "rect", size });
            return { nodes: [withProvenance(node, prov)], provenance: prov };
        }
    }
}
