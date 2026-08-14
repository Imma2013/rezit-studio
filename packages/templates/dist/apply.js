"use strict";
// Apply pipelines. Apply-to-new deep-copies the
// template into a fresh, decoupled design; apply-into-existing appends the
// template's (deep-copied) pages onto a clone of the target. Inherited stock
// attributions have their node ids remapped to the copy so credits stay correct.
Object.defineProperty(exports, "__esModule", { value: true });
exports.remapAttributions = remapAttributions;
exports.applyTemplateToNew = applyTemplateToNew;
exports.applyTemplateIntoExisting = applyTemplateIntoExisting;
const deepcopy_1 = require("./deepcopy");
const lockedregions_1 = require("./lockedregions");
/** Remap an attribution entry's node ids through a deep-copy id map. */
function remapAttributions(attrs, idMap) {
    return attrs.map((a) => ({
        ...a,
        nodeIds: a.nodeIds.map((id) => idMap.get(id) ?? id),
    }));
}
/**
 * Apply a template to a brand-new design (FR-5): a deep copy with fresh ids,
 * decoupled from the source, with inherited attributions remapped. The source
 * template is never mutated (FR-14). Brand locked-region ids are
 * remapped through the deep-copy id map and written onto the new design's meta,
 * so they point at the copied nodes rather than the template's originals.
 */
function applyTemplateToNew(templateFile, attributions = [], opts = {}) {
    const { file, idMap } = (0, deepcopy_1.deepCopyDesign)(templateFile, opts);
    const locked = (0, lockedregions_1.remapLockedRegions)((0, lockedregions_1.readLockedRegions)(templateFile), idMap);
    return {
        file: (0, lockedregions_1.withLockedRegions)(file, locked),
        idMap,
        attributions: remapAttributions(attributions, idMap),
    };
}
/**
 * Append a template's pages into an existing design (FR-6). Returns a new file
 * (the target is not mutated) with the template's deep-copied pages added, plus
 * the merged-ready remapped attributions to fold into the design's credits.
 */
function applyTemplateIntoExisting(target, templateFile, attributions = [], opts = {}) {
    const clone = JSON.parse(JSON.stringify(target));
    const { file: copied, idMap } = (0, deepcopy_1.deepCopyDesign)(templateFile, opts);
    clone.pages.push(...copied.pages);
    // Merge the template's remapped locked regions onto the target's existing
    // ones so appended brand pages stay layout-locked too.
    const merged = [
        ...(0, lockedregions_1.readLockedRegions)(clone),
        ...(0, lockedregions_1.remapLockedRegions)((0, lockedregions_1.readLockedRegions)(templateFile), idMap),
    ];
    const file = (0, lockedregions_1.withLockedRegions)(clone, merged);
    return { file, idMap, attributions: remapAttributions(attributions, idMap) };
}
