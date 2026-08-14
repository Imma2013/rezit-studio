import type { DesignFile } from "@hc/schema";
/** The design-meta key holding the instantiated locked-region node ids. */
export declare const BRAND_LOCKED_REGIONS_META = "brandLockedRegions";
/** Remap a brand template's locked-region node ids through a deep-copy id map
 *  (template id -> new design id). Ids with no mapping are dropped (the node was
 *  not copied), so a stale id never locks a non-existent node. */
export declare function remapLockedRegions(lockedRegions: readonly string[], idMap: Map<string, string>): string[];
/** Write the (already-remapped) locked-region ids onto a design's meta (FR-6),
 *  returning a new DesignFile (the input is not mutated). An empty list clears
 *  the key so a non-brand template never leaves a stray marker. */
export declare function withLockedRegions(file: DesignFile, lockedRegions: readonly string[]): DesignFile;
/** Read the locked-region node ids a design carries (FR-6), or `[]`. */
export declare function readLockedRegions(file: DesignFile): string[];
