"use strict";
// Snapping and smart guides (FR-13..FR-15). Pure geometry over page-space AABBs:
// candidates are the edges and centers of other objects, the page box, and the
// grid; the closest within a screen-space threshold wins per axis. Thresholds
// are passed in page units (the caller divides the screen threshold by zoom so
// behavior is consistent across zoom levels).
Object.defineProperty(exports, "__esModule", { value: true });
exports.snap = snap;
exports.spacingSnap = spacingSnap;
exports.resizeSpacingSnap = resizeSpacingSnap;
exports.detectEqualSpacing = detectEqualSpacing;
function edgesX(r) {
    return [r.x, r.x + r.width / 2, r.x + r.width];
}
function edgesY(r) {
    return [r.y, r.y + r.height / 2, r.y + r.height];
}
function bestAxisSnap(movingEdges, targets, threshold) {
    let best = { delta: 0, guide: null };
    let bestDist = threshold + Number.EPSILON;
    for (const edge of movingEdges) {
        for (const target of targets) {
            const dist = Math.abs(target - edge);
            if (dist <= threshold && dist < bestDist) {
                bestDist = dist;
                best = { delta: target - edge, guide: target };
            }
        }
    }
    return best;
}
/** Compute the snap offset (dx, dy) and matched guide lines for a moving box. */
function snap(moving, statics, opts = {}) {
    const threshold = opts.threshold ?? 6;
    const targetsX = [];
    const targetsY = [];
    for (const s of statics) {
        targetsX.push(...edgesX(s));
        targetsY.push(...edgesY(s));
    }
    if (opts.pageRect) {
        targetsX.push(...edgesX(opts.pageRect));
        targetsY.push(...edgesY(opts.pageRect));
    }
    if (opts.grid && opts.grid > 0) {
        const g = opts.grid;
        for (const e of edgesX(moving))
            targetsX.push(Math.round(e / g) * g);
        for (const e of edgesY(moving))
            targetsY.push(Math.round(e / g) * g);
    }
    const sx = bestAxisSnap(edgesX(moving), targetsX, threshold);
    const sy = bestAxisSnap(edgesY(moving), targetsY, threshold);
    return {
        dx: sx.delta,
        dy: sy.delta,
        guidesX: sx.guide === null ? [] : [sx.guide],
        guidesY: sy.guide === null ? [] : [sy.guide],
    };
}
function rangesOverlap(a0, a1, b0, b1) {
    return a0 < b1 && b0 < a1;
}
/**
 * Equal-spacing (distribution) snap for a moving box against static neighbors
 * along one axis (the equal-spacing guides). Only boxes that share a band
 * on the cross axis count as in-line neighbors. Two behaviors are considered and
 * the smaller correction wins:
 *
 *   A. Center between the nearest left and right neighbor so both gaps are equal.
 *   B. Match an adjacent pair's gap so the box extends an evenly spaced chain
 *      (gap to the near neighbor equals that neighbor's gap to the next box).
 *
 * Returns the snap delta along `axis` and the gap regions to draw. All spacing
 * bars are placed on the moving box's centerline for a consistent readout.
 */
function spacingSnap(moving, statics, axis, threshold = 6) {
    const lo = (r) => (axis === "x" ? r.x : r.y);
    const sz = (r) => (axis === "x" ? r.width : r.height);
    const hi = (r) => lo(r) + sz(r);
    const clo = (r) => (axis === "x" ? r.y : r.x);
    const csz = (r) => (axis === "x" ? r.height : r.width);
    const chi = (r) => clo(r) + csz(r);
    const mLo = lo(moving);
    const mHi = hi(moving);
    const mSz = sz(moving);
    const cross = (clo(moving) + chi(moving)) / 2;
    // Only boxes overlapping the moving box on the cross axis are in-line with it.
    const mates = statics.filter((s) => rangesOverlap(clo(moving), chi(moving), clo(s), chi(s)));
    // Nearest neighbor fully to the left/below and right/above of the moving box.
    let left = null;
    let right = null;
    for (const s of mates) {
        if (hi(s) <= mLo + threshold) {
            if (!left || hi(s) > hi(left))
                left = s;
        }
        else if (lo(s) >= mHi - threshold) {
            if (!right || lo(s) < lo(right))
                right = s;
        }
    }
    const candidates = [];
    // A. Equal gaps to both neighbors (centered distribution).
    if (left && right) {
        const gap = (lo(right) - hi(left) - mSz) / 2;
        if (gap >= 0) {
            const targetLo = hi(left) + gap;
            const delta = targetLo - mLo;
            if (Math.abs(delta) <= threshold) {
                candidates.push({
                    delta,
                    guide: {
                        axis,
                        gap,
                        segments: [
                            { from: hi(left), to: targetLo, cross },
                            { from: targetLo + mSz, to: lo(right), cross },
                        ],
                    },
                });
            }
        }
    }
    // B. Match the left neighbor's own gap to the box beyond it.
    if (left) {
        let left2 = null;
        for (const s of mates) {
            if (s === left)
                continue;
            if (hi(s) <= lo(left) + threshold && (!left2 || hi(s) > hi(left2)))
                left2 = s;
        }
        if (left2) {
            const refGap = lo(left) - hi(left2);
            if (refGap >= 0) {
                const targetLo = hi(left) + refGap;
                const delta = targetLo - mLo;
                if (Math.abs(delta) <= threshold) {
                    candidates.push({
                        delta,
                        guide: {
                            axis,
                            gap: refGap,
                            segments: [
                                { from: hi(left2), to: lo(left), cross },
                                { from: hi(left), to: targetLo, cross },
                            ],
                        },
                    });
                }
            }
        }
    }
    // B (mirror). Match the right neighbor's own gap to the box beyond it.
    if (right) {
        let right2 = null;
        for (const s of mates) {
            if (s === right)
                continue;
            if (lo(s) >= hi(right) - threshold && (!right2 || lo(s) < lo(right2)))
                right2 = s;
        }
        if (right2) {
            const refGap = lo(right2) - hi(right);
            if (refGap >= 0) {
                const targetHi = lo(right) - refGap;
                const targetLo = targetHi - mSz;
                const delta = targetLo - mLo;
                if (Math.abs(delta) <= threshold) {
                    candidates.push({
                        delta,
                        guide: {
                            axis,
                            gap: refGap,
                            segments: [
                                { from: targetHi, to: lo(right), cross },
                                { from: hi(right), to: lo(right2), cross },
                            ],
                        },
                    });
                }
            }
        }
    }
    if (!candidates.length)
        return { delta: 0, guide: null };
    candidates.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
    return { delta: candidates[0].delta, guide: candidates[0].guide };
}
/**
 * Equal-spacing snap while resizing one edge of `moving`. `handle` is the edge
 * being dragged (e/w/n/s); the opposite (anchor) edge is held fixed. Returns a
 * delta for the dragged edge so the box's two gaps to its nearest neighbors on
 * that axis become equal (matching the moving-side gap to the fixed anchor-side
 * gap), plus the gap segments to render. Null when there isn't a neighbor on
 * both sides (overlapping the box on the cross axis) or the snap is out of range.
 */
function resizeSpacingSnap(moving, handle, statics, threshold = 6) {
    const left = moving.x, right = moving.x + moving.width;
    const top = moving.y, bottom = moving.y + moving.height;
    if (handle === "e" || handle === "w") {
        const mates = statics.filter((s) => s.y < bottom && top < s.y + s.height);
        let L = null, R = null;
        for (const s of mates) {
            const sr = s.x + s.width;
            if (sr <= left) {
                if (!L || sr > L.x + L.width)
                    L = s;
            }
            else if (s.x >= right) {
                if (!R || s.x < R.x)
                    R = s;
            }
        }
        if (!L || !R)
            return null;
        const Lr = L.x + L.width, cross = (top + bottom) / 2;
        if (handle === "e") {
            const leftGap = left - Lr, target = R.x - leftGap;
            if (leftGap < 0 || target <= left || Math.abs(target - right) > threshold)
                return null;
            return { delta: target - right, axis: "x", gap: leftGap, s1: [Lr, left], s2: [target, R.x], cross };
        }
        const rightGap = R.x - right, target = Lr + rightGap;
        if (rightGap < 0 || target >= right || Math.abs(target - left) > threshold)
            return null;
        return { delta: target - left, axis: "x", gap: rightGap, s1: [Lr, target], s2: [right, R.x], cross };
    }
    const mates = statics.filter((s) => s.x < right && left < s.x + s.width);
    let T = null, B = null;
    for (const s of mates) {
        const sb = s.y + s.height;
        if (sb <= top) {
            if (!T || sb > T.y + T.height)
                T = s;
        }
        else if (s.y >= bottom) {
            if (!B || s.y < B.y)
                B = s;
        }
    }
    if (!T || !B)
        return null;
    const Tb = T.y + T.height, cross = (left + right) / 2;
    if (handle === "s") {
        const topGap = top - Tb, target = B.y - topGap;
        if (topGap < 0 || target <= top || Math.abs(target - bottom) > threshold)
            return null;
        return { delta: target - bottom, axis: "y", gap: topGap, s1: [Tb, top], s2: [target, B.y], cross };
    }
    const bottomGap = B.y - bottom, target = Tb + bottomGap;
    if (bottomGap < 0 || target >= bottom || Math.abs(target - top) > threshold)
        return null;
    return { delta: target - top, axis: "y", gap: bottomGap, s1: [Tb, target], s2: [bottom, B.y], cross };
}
/**
 * Equal-spacing detection for 3+ boxes along an axis (FR-14). Returns the common
 * gap when consecutive gaps between sorted boxes match within tolerance.
 */
function detectEqualSpacing(boxes, axis, tolerance = 0.5) {
    if (boxes.length < 3)
        return { equal: false, gap: 0 };
    const sorted = [...boxes].sort((a, b) => (axis === "x" ? a.x - b.x : a.y - b.y));
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        const gap = axis === "x"
            ? cur.x - (prev.x + prev.width)
            : cur.y - (prev.y + prev.height);
        gaps.push(gap);
    }
    const first = gaps[0];
    const equal = gaps.every((g) => Math.abs(g - first) <= tolerance);
    return { equal, gap: equal ? first : 0 };
}
