"use strict";
// Brand-template locked regions. When a brand template that
// marks certain node ids as locked is instantiated into a new design, the
// deep-copy regenerates every node id, so the template's locked-region ids must
// be remapped through the deep-copy id map and written onto the resulting
// design's meta. The editor then gates structural mutation (move/resize/rotate/
// restyle/delete) of those nodes for non-manage-brand users (a filler can edit
// fillable fields but not break the locked layout/logo regions).
//
// Pure: this is a small mapping over the apply id map, with no IO.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRAND_LOCKED_REGIONS_META = void 0;
exports.remapLockedRegions = remapLockedRegions;
exports.withLockedRegions = withLockedRegions;
exports.readLockedRegions = readLockedRegions;
/** The design-meta key holding the instantiated locked-region node ids. */
exports.BRAND_LOCKED_REGIONS_META = "brandLockedRegions";
/** Remap a brand template's locked-region node ids through a deep-copy id map
 *  (template id -> new design id). Ids with no mapping are dropped (the node was
 *  not copied), so a stale id never locks a non-existent node. */
function remapLockedRegions(lockedRegions, idMap) {
    const out = [];
    for (const id of lockedRegions) {
        const mapped = idMap.get(id);
        if (mapped)
            out.push(mapped);
    }
    return out;
}
/** Write the (already-remapped) locked-region ids onto a design's meta (FR-6),
 *  returning a new DesignFile (the input is not mutated). An empty list clears
 *  the key so a non-brand template never leaves a stray marker. */
function withLockedRegions(file, lockedRegions) {
    const meta = { ...(file.meta ?? {}) };
    if (lockedRegions.length > 0)
        meta[exports.BRAND_LOCKED_REGIONS_META] = [...lockedRegions];
    else
        delete meta[exports.BRAND_LOCKED_REGIONS_META];
    return { ...file, meta };
}
/** Read the locked-region node ids a design carries (FR-6), or `[]`. */
function readLockedRegions(file) {
    const v = file.meta?.[exports.BRAND_LOCKED_REGIONS_META];
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}
