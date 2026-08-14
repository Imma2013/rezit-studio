import { type DesignFile, type Node } from "@hc/schema";
import { type AttributionEntry, type NodeProvenance } from "./types";
/** Read provenance stamped on a node (by {@link withProvenance}), if any. */
export declare function nodeProvenance(node: Node): NodeProvenance | undefined;
/**
 * Compile the required attribution credits for a design (FR-14). Groups by
 * source asset, lists the contributing node ids, and includes only
 * attribution-required stock provenance. Deterministically ordered by assetId.
 */
export declare function compileAttribution(file: DesignFile): AttributionEntry[];
/** Render compiled credits as plain text lines (for copy or export metadata). */
export declare function attributionText(entries: AttributionEntry[]): string;
