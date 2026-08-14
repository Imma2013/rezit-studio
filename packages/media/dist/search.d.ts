import type { Asset, AssetQuery } from "./types";
/** Whether a single asset satisfies a query. */
export declare function matchAsset(asset: Asset, query: AssetQuery): boolean;
/** Filter and sort assets for a query (FR-9). Pure; no pagination. */
export declare function searchAssets(assets: Asset[], query?: AssetQuery): Asset[];
