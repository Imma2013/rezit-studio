import { type AssetRef, type Node } from "@hc/schema";
import { type NodeProvenance, type StockAsset } from "./types";
export interface Insertion {
    nodes: Node[];
    assetRef?: AssetRef;
    provenance: NodeProvenance;
    /** True when a vector insert approximated arcs (fidelity note). */
    approximated?: boolean;
}
/** Stamp provenance onto a node under the agreed data key (serialized in-file). */
export declare function withProvenance<T extends Node>(node: T, prov: NodeProvenance): T;
/**
 * Materialize a stock asset into editable nodes. Pure: returns the nodes,
 * an optional AssetRef to add to the design, and provenance. `idGen` lets tests
 * be deterministic.
 */
export declare function stockToNodes(asset: StockAsset, idGen?: () => string): Insertion;
