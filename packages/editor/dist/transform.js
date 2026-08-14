"use strict";
// Pure transform operations on a node's Transform + Size. Geometry is
// computed in the node's parent space (page space for top-level nodes). Resize
// is anchor-fixed and rotation-aware: the corner/edge opposite the dragged
// handle stays put in world space. Flips are negative scale about the box center.
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTransform = moveTransform;
exports.rotateTransform = rotateTransform;
exports.rotateAboutCenter = rotateAboutCenter;
exports.rotateAboutPoint = rotateAboutPoint;
exports.setSkew = setSkew;
exports.flipNode = flipNode;
exports.resizeNode = resizeNode;
exports.decompose = decompose;
const engine_1 = require("@hc/engine");
const MIN_SIZE = 1e-3;
const DEG = Math.PI / 180;
function moveTransform(t, dx, dy, axisLock) {
    const ddx = axisLock === "y" ? 0 : dx;
    const ddy = axisLock === "x" ? 0 : dy;
    return { ...t, x: t.x + ddx, y: t.y + ddy };
}
/**
 * Recompute x,y so the box center stays fixed when only the linear part of the
 * transform changes (rotation/scale/flip). Pivoting about the center is what
 * the user expects; `fromTransform` itself rotates/scales about the local
 * origin (0,0), so without this the box would swing around its top-left corner.
 */
function keepCenterFixed(oldT, newT, size) {
    const cx = size.width / 2;
    const cy = size.height / 2;
    const center = (0, engine_1.applyToPoint)((0, engine_1.fromTransform)(oldT), { x: cx, y: cy });
    const m = (0, engine_1.fromTransform)(newT);
    return {
        ...newT,
        x: center.x - (m.a * cx + m.c * cy),
        y: center.y - (m.b * cx + m.d * cy),
    };
}
/** Rotate by a delta in degrees; snap to 15-degree increments when requested.
 *  Pure transform helper that does NOT adjust translation (rotates about the
 *  local origin). Prefer `rotateAboutCenter` for interactive rotation. */
function rotateTransform(t, deltaDeg, snap = false) {
    let rotation = t.rotation + deltaDeg;
    if (snap)
        rotation = Math.round(rotation / 15) * 15;
    return { ...t, rotation };
}
/** Rotate a node by a delta in degrees about its box center, so it spins in
 *  place. Snap to 15-degree increments when requested. */
function rotateAboutCenter(t, size, deltaDeg, snap = false) {
    return rotateAboutPoint(t, size, deltaDeg, { x: 0.5, y: 0.5 }, snap);
}
/** Rotate a node by a delta in degrees about an arbitrary LOCAL pivot, given
 *  as a normalized box fraction (0..1 per axis; {0.5,0.5} is the center), and
 *  recompute the translation so that pivot stays fixed in world space. This is
 *  what makes the "Rotate around" origin picker take effect. Snap to 15-degree
 *  increments when requested. Correct for scaled/flipped/skewed nodes too. */
function rotateAboutPoint(t, size, deltaDeg, origin, snap = false) {
    let rotation = t.rotation + deltaDeg;
    if (snap)
        rotation = Math.round(rotation / 15) * 15;
    const px = size.width * origin.x;
    const py = size.height * origin.y;
    const pivotWorld = (0, engine_1.applyToPoint)((0, engine_1.fromTransform)(t), { x: px, y: py });
    const next = { ...t, rotation };
    const m = (0, engine_1.fromTransform)(next);
    return {
        ...next,
        x: pivotWorld.x - (m.a * px + m.c * py),
        y: pivotWorld.y - (m.b * px + m.d * py),
    };
}
function setSkew(t, skewX, skewY) {
    return { ...t, skewX, skewY };
}
/** Flip horizontally or vertically: negate the scale on that local axis while
 *  keeping the box center fixed. Correct for rotated/skewed nodes too. */
function flipNode(node, axis) {
    const t = node.transform;
    const flipped = axis === "h" ? { ...t, scaleX: -t.scaleX } : { ...t, scaleY: -t.scaleY };
    return keepCenterFixed(t, flipped, node.size);
}
// Fractional position of a handle within the local box (0=left/top, 1=right/bottom).
const HANDLE_FRACTION = {
    nw: { fx: 0, fy: 0 },
    n: { fx: 0.5, fy: 0 },
    ne: { fx: 1, fy: 0 },
    e: { fx: 1, fy: 0.5 },
    se: { fx: 1, fy: 1 },
    s: { fx: 0.5, fy: 1 },
    sw: { fx: 0, fy: 1 },
    w: { fx: 0, fy: 0.5 },
};
/** Inverse of the matrix's linear part applied to a direction vector. */
function linearInverse(m, v) {
    const det = m.a * m.d - m.b * m.c;
    if (Math.abs(det) < 1e-12)
        return { x: 0, y: 0 };
    return {
        x: (m.d * v.x - m.c * v.y) / det,
        y: (-m.b * v.x + m.a * v.y) / det,
    };
}
/**
 * Resize a node by dragging `handle` by (dx, dy) in parent space. Returns the
 * new transform and size with the opposite anchor fixed in world space.
 */
function resizeNode(node, handle, dx, dy, opts = {}) {
    const t = node.transform;
    const { width: w0, height: h0 } = node.size;
    const { fx, fy } = HANDLE_FRACTION[handle];
    const m = (0, engine_1.fromTransform)(t);
    // Move the drag delta into the node's local axes.
    const local = linearInverse(m, { x: dx, y: dy });
    // Which axes the handle drives: +1 grows with +delta (right/bottom edge),
    // -1 grows with -delta (left/top edge), 0 = fixed axis.
    const sxDir = fx === 1 ? 1 : fx === 0 ? -1 : 0;
    const syDir = fy === 1 ? 1 : fy === 0 ? -1 : 0;
    const factor = opts.fromCenter ? 2 : 1;
    // Raw (signed) extents: dragging past the anchor goes negative, which flips
    // the node on that axis and keeps resizing mirrored (drag-through, like other
    // design tools) instead of pinning at the minimum size.
    const wRaw = w0 + sxDir * local.x * factor;
    const hRaw = h0 + syDir * local.y * factor;
    const flipX = wRaw < 0;
    const flipY = hRaw < 0;
    let w = Math.max(MIN_SIZE, Math.abs(wRaw));
    let h = Math.max(MIN_SIZE, Math.abs(hRaw));
    if (opts.aspect && sxDir !== 0 && syDir !== 0) {
        // Constrain to the original ratio using the larger relative change
        // (magnitudes only; the flips above are independent of aspect).
        const ratio = w0 / h0;
        if (Math.abs(w / w0 - 1) >= Math.abs(h / h0 - 1))
            h = w / ratio;
        else
            w = h * ratio;
    }
    // Anchor: opposite corner/edge for corners; box center when resizing from
    // center; edge midpoint on the fixed axis for edge handles.
    const ax = opts.fromCenter ? 0.5 : fx === 0.5 ? 0.5 : 1 - fx;
    const ay = opts.fromCenter ? 0.5 : fy === 0.5 ? 0.5 : 1 - fy;
    const anchorWorld = (0, engine_1.applyToPoint)(m, { x: ax * w0, y: ay * h0 });
    // Recompute translation so the anchor stays fixed, using the NEW linear part
    // (a flip negates that axis' scale, which changes where local points land).
    const tNew = {
        ...t,
        scaleX: flipX ? -t.scaleX : t.scaleX,
        scaleY: flipY ? -t.scaleY : t.scaleY,
    };
    const mNew = (0, engine_1.fromTransform)({ ...tNew, x: 0, y: 0 });
    const anchorLocalNew = { x: ax * w, y: ay * h };
    const linearAnchor = {
        x: mNew.a * anchorLocalNew.x + mNew.c * anchorLocalNew.y,
        y: mNew.b * anchorLocalNew.x + mNew.d * anchorLocalNew.y,
    };
    return {
        transform: { ...tNew, x: anchorWorld.x - linearAnchor.x, y: anchorWorld.y - linearAnchor.y },
        size: { width: w, height: h },
    };
}
/**
 * Decompose an affine matrix back to a Transform (translate, rotation, scaleX,
 * scaleY, skewX), used by ungroup to bake a group's transform into its children.
 * The determinant sign is carried on scaleY so reflections round-trip:
 * `fromTransform(decompose(M))` reproduces M for translate/rotate/scale/flip
 * (and a single shear; double-skew is folded in).
 */
function decompose(m) {
    const { a, b, c, d, e, f } = m;
    const det = a * d - b * c;
    const r = Math.hypot(a, b);
    if (r < 1e-12) {
        // Degenerate x-basis: fall back to the y-basis (rare).
        const sy = Math.hypot(c, d);
        return {
            x: e,
            y: f,
            scaleX: 0,
            scaleY: sy,
            rotation: (Math.atan2(d, c) - Math.PI / 2) / DEG,
            skewX: 0,
            skewY: 0,
        };
    }
    return {
        x: e,
        y: f,
        scaleX: r,
        scaleY: det / r, // signed: encodes a reflection
        rotation: Math.atan2(b, a) / DEG,
        skewX: Math.atan2(a * c + b * d, r * r) / DEG,
        skewY: 0,
    };
}
