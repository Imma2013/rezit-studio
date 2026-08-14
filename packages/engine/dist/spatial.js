"use strict";
// Spatial index (F30 FR-27): a uniform-grid spatial hash over page-space AABBs.
// Gives sublinear viewport queries for render culling, presence interest
// management, and the AI agent's off-screen cluster context. Pure, no DOM.
//
// A uniform grid (vs a quadtree) is simple, allocation-light, and ideal for the
// typical board where nodes are small relative to the canvas; a single very large
// node spans many cells (more bucket entries) but still queries correctly. The
// query re-tests the precise AABB so callers get exact intersect results.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialIndex = void 0;
const math_1 = require("./math");
class SpatialIndex {
    constructor(cellSize = 512) {
        this.buckets = new Map();
        this.rects = new Map();
        this.cell = Math.max(1, cellSize);
    }
    key(cx, cy) {
        return cx + ":" + cy;
    }
    cellsOf(r) {
        return {
            x0: Math.floor(r.x / this.cell),
            y0: Math.floor(r.y / this.cell),
            x1: Math.floor((r.x + r.width) / this.cell),
            y1: Math.floor((r.y + r.height) / this.cell),
        };
    }
    /** Index `id` by its page-space AABB (last write wins for a repeated id). */
    insert(id, rect) {
        if (this.rects.has(id))
            this.remove(id);
        this.rects.set(id, rect);
        const c = this.cellsOf(rect);
        for (let cy = c.y0; cy <= c.y1; cy++) {
            for (let cx = c.x0; cx <= c.x1; cx++) {
                const k = this.key(cx, cy);
                const b = this.buckets.get(k);
                if (b)
                    b.push(id);
                else
                    this.buckets.set(k, [id]);
            }
        }
    }
    remove(id) {
        const r = this.rects.get(id);
        if (!r)
            return;
        this.rects.delete(id);
        const c = this.cellsOf(r);
        for (let cy = c.y0; cy <= c.y1; cy++) {
            for (let cx = c.x0; cx <= c.x1; cx++) {
                const k = this.key(cx, cy);
                const b = this.buckets.get(k);
                if (!b)
                    continue;
                const i = b.indexOf(id);
                if (i >= 0)
                    b.splice(i, 1);
                if (b.length === 0)
                    this.buckets.delete(k);
            }
        }
    }
    /** Ids whose AABB intersects `rect`, deduped and precise-intersect-filtered. */
    queryRect(rect) {
        const c = this.cellsOf(rect);
        const seen = new Set();
        const out = [];
        for (let cy = c.y0; cy <= c.y1; cy++) {
            for (let cx = c.x0; cx <= c.x1; cx++) {
                const b = this.buckets.get(this.key(cx, cy));
                if (!b)
                    continue;
                for (const id of b) {
                    if (seen.has(id))
                        continue;
                    seen.add(id);
                    const r = this.rects.get(id);
                    if (r && (0, math_1.rectIntersects)(rect, r))
                        out.push(id);
                }
            }
        }
        return out;
    }
    get size() {
        return this.rects.size;
    }
}
exports.SpatialIndex = SpatialIndex;
