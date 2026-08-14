import type { AttributionEntry } from "@hc/stock";
/** Merge incoming attribution entries into existing ones, dedup by assetId. */
export declare function mergeAttributions(existing: AttributionEntry[], incoming: AttributionEntry[]): AttributionEntry[];
