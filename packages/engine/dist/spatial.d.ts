import type { Rect } from "./math";
export declare class SpatialIndex {
    private readonly cell;
    private readonly buckets;
    private readonly rects;
    constructor(cellSize?: number);
    private key;
    private cellsOf;
    /** Index `id` by its page-space AABB (last write wins for a repeated id). */
    insert(id: string, rect: Rect): void;
    remove(id: string): void;
    /** Ids whose AABB intersects `rect`, deduped and precise-intersect-filtered. */
    queryRect(rect: Rect): string[];
    get size(): number;
}
