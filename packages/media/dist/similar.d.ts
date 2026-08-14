export interface Hashed {
    hash: string;
}
export interface SimilarityHit<T> {
    item: T;
    distance: number;
}
export interface SimilarityOptions {
    /** Drop results whose distance exceeds this threshold (default: keep all). */
    maxDistance?: number;
    /** Cap the number of results returned (default: all). */
    limit?: number;
    /** Exclude an exact-match item (e.g. the query asset itself). */
    excludeExact?: boolean;
}
/** Rank `items` by similarity to `targetHash`, nearest first. Items with an
 *  unequal-length or empty hash are skipped (incomparable). Stable for ties. */
export declare function rankSimilar<T extends Hashed>(targetHash: string, items: T[], opts?: SimilarityOptions): SimilarityHit<T>[];
