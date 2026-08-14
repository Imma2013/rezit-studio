import type { DesignFile } from "@hc/schema";
import type { AttributionEntry } from "@hc/stock";
import { type DeepCopyOptions } from "./deepcopy";
/** Remap an attribution entry's node ids through a deep-copy id map. */
export declare function remapAttributions(attrs: AttributionEntry[], idMap: Map<string, string>): AttributionEntry[];
export interface ApplyResult {
    file: DesignFile;
    idMap: Map<string, string>;
    attributions: AttributionEntry[];
}
/**
 * Apply a template to a brand-new design (FR-5): a deep copy with fresh ids,
 * decoupled from the source, with inherited attributions remapped. The source
 * template is never mutated (FR-14). Brand locked-region ids are
 * remapped through the deep-copy id map and written onto the new design's meta,
 * so they point at the copied nodes rather than the template's originals.
 */
export declare function applyTemplateToNew(templateFile: DesignFile, attributions?: AttributionEntry[], opts?: DeepCopyOptions): ApplyResult;
/**
 * Append a template's pages into an existing design (FR-6). Returns a new file
 * (the target is not mutated) with the template's deep-copied pages added, plus
 * the merged-ready remapped attributions to fold into the design's credits.
 */
export declare function applyTemplateIntoExisting(target: DesignFile, templateFile: DesignFile, attributions?: AttributionEntry[], opts?: DeepCopyOptions): ApplyResult;
