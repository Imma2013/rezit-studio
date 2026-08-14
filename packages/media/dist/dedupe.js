"use strict";
// Duplicate classification at ingest. Exact match on the
// sha-256 checksum; near match on perceptual-hash Hamming distance. The result
// drives the user's resolution choices ("use existing" / "keep both" /
// "replace as new version").
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyDuplicate = classifyDuplicate;
const phash_1 = require("./phash");
/**
 * Classify an incoming upload against existing library assets. Exact-dupe takes
 * precedence; otherwise the closest perceptual match within threshold is a
 * near-dupe. Trashed assets are ignored as match candidates.
 */
function classifyDuplicate(incoming, candidates, maxDistance = phash_1.NEAR_DUPLICATE_MAX_DISTANCE) {
    const live = candidates.filter((c) => c.status !== "trashed");
    const exact = live.find((c) => c.checksum === incoming.checksum);
    if (exact) {
        return { kind: "exact", match: exact, distance: 0, actions: ["use-existing", "keep-both"] };
    }
    if (incoming.perceptualHash) {
        let best;
        let bestDist = Infinity;
        for (const c of live) {
            if (!c.perceptualHash || c.perceptualHash.length !== incoming.perceptualHash.length)
                continue;
            const d = (0, phash_1.hammingDistance)(incoming.perceptualHash, c.perceptualHash);
            if (d < bestDist) {
                bestDist = d;
                best = c;
            }
        }
        if (best && bestDist <= maxDistance) {
            return { kind: "near", match: best, distance: bestDist, actions: ["use-existing", "keep-both", "replace-version"] };
        }
    }
    return { kind: "none", actions: ["keep-both"] };
}
