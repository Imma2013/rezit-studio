import type { AssetStatus } from "./types";
export declare function canTransition(from: AssetStatus, to: AssetStatus): boolean;
/** Apply a transition, throwing on an illegal one. */
export declare function transition(from: AssetStatus, to: AssetStatus): AssetStatus;
/** Only `ready` assets are placeable/shareable/searchable (FR-4, FR-16). */
export declare function isUsable(status: AssetStatus): boolean;
/** Whether an asset is still being ingested (UI shows a spinner). */
export declare function isProcessing(status: AssetStatus): boolean;
