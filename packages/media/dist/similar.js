"use strict";
// Perceptual-similarity ranking: given a target perceptual hash,
// rank a set of assets by visual closeness (Hamming distance of their average
// hashes). Pure and model-free, this is the "find similar / more like this"
// retrieval over already-computed phashes (the embedding/pgvector path is a
// separate, heavier option). Lower distance = more similar.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankSimilar = rankSimilar;
const phash_1 = require("./phash");
/** Rank `items` by similarity to `targetHash`, nearest first. Items with an
 *  unequal-length or empty hash are skipped (incomparable). Stable for ties. */
function rankSimilar(targetHash, items, opts = {}) {
    const hits = [];
    for (const item of items) {
        if (!item.hash || item.hash.length !== targetHash.length)
            continue;
        const distance = (0, phash_1.hammingDistance)(targetHash, item.hash);
        if (opts.excludeExact && distance === 0)
            continue;
        if (opts.maxDistance !== undefined && distance > opts.maxDistance)
            continue;
        hits.push({ item, distance });
    }
    hits.sort((a, b) => a.distance - b.distance);
    return opts.limit !== undefined ? hits.slice(0, opts.limit) : hits;
}
