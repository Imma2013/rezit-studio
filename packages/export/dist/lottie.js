"use strict";
// Lottie (Bodymovin) animated-vector export. Pure and dependency-free:
// converts a design page's node animations into a Lottie JSON document. Each node
// becomes a shape layer (a coloured rectangle at the node's size); its transform
// (position/scale/rotation/opacity) is baked into Lottie keyframes by sampling
// the shared @hc/engine animation math at the chosen frame rate, so an exported
// Lottie plays back exactly like the in-editor preview and present mode.
Object.defineProperty(exports, "__esModule", { value: true });
exports.designPageToLottie = designPageToLottie;
const schema_1 = require("@hc/schema");
const engine_1 = require("@hc/engine");
function compose(a, b) {
    const base = a ?? engine_1.IDENTITY_PATCH;
    return {
        dx: base.dx + b.dx,
        dy: base.dy + b.dy,
        scale: base.scale * b.scale,
        rotate: base.rotate + b.rotate,
        opacityMul: base.opacityMul * b.opacityMul,
    };
}
function patchAt(node, tMs) {
    const anim = node.animation;
    const motion = node.type === "image" ? node.motion : undefined;
    let patch = null;
    const entEnd = (0, engine_1.clipEnd)(anim?.entrance);
    if (anim?.entrance && tMs <= entEnd)
        patch = (0, engine_1.entrancePatch)(anim.entrance, tMs);
    else if (anim?.emphasis)
        patch = (0, engine_1.emphasisPatch)(anim.emphasis, tMs - entEnd);
    else if (anim?.entrance)
        patch = (0, engine_1.entrancePatch)(anim.entrance, entEnd);
    if (anim?.custom)
        patch = compose(patch, (0, engine_1.customPatch)(anim.custom, tMs - entEnd));
    if (motion)
        patch = compose(patch, (0, engine_1.imageMotionPatch)(motion, tMs));
    return patch ?? { ...engine_1.IDENTITY_PATCH };
}
function isAnimated(node) {
    const anim = node.animation;
    const motion = node.type === "image" ? node.motion : undefined;
    return Boolean(anim?.entrance || anim?.emphasis || anim?.custom || motion);
}
function fillColor(node) {
    const fills = node.fills;
    const solid = fills?.find((f) => f.type === "solid");
    if (solid && solid.type === "solid") {
        const c = solid.color.srgb;
        return [c.r, c.g, c.b, 1];
    }
    return [0.8, 0.8, 0.8, 1]; // neutral default so shapes are visible
}
// Build an animated-or-static Lottie property from per-frame samples.
function prop(samples, totalFrames) {
    const allEqual = samples.every((s) => s.every((v, i) => v === samples[0][i]));
    if (allEqual)
        return { a: 0, k: samples[0].length === 1 ? samples[0][0] : samples[0] };
    const k = samples.map((s, f) => ({
        t: f,
        s,
        i: { x: [0.833], y: [0.833] },
        o: { x: [0.167], y: [0.167] },
    }));
    k.push({ t: totalFrames, s: samples[samples.length - 1] });
    return { a: 1, k };
}
function layerFor(node, ind, frames, fps) {
    const t = node.transform;
    const w = Math.max(1, node.size.width);
    const h = Math.max(1, node.size.height);
    const pos = [];
    const scale = [];
    const rot = [];
    const op = [];
    for (let f = 0; f <= frames; f++) {
        const p = patchAt(node, (f / fps) * 1000);
        pos.push([t.x + p.dx, t.y + p.dy]);
        scale.push([t.scaleX * p.scale * 100, t.scaleY * p.scale * 100]);
        rot.push([t.rotation + p.rotate]);
        op.push([(0, engine_1.appliedOpacity)(node.opacity, p.opacityMul) * 100]);
    }
    const c = fillColor(node);
    return {
        ddd: 0,
        ind,
        ty: 4,
        nm: node.name ?? node.type,
        sr: 1,
        ks: {
            o: prop(op, frames),
            r: prop(rot, frames),
            p: prop(pos, frames),
            a: { a: 0, k: [0, 0, 0] },
            s: prop(scale, frames),
        },
        shapes: [
            {
                ty: "gr",
                nm: "group",
                it: [
                    { ty: "rc", nm: "rect", d: 1, s: { a: 0, k: [w, h] }, p: { a: 0, k: [w / 2, h / 2] }, r: { a: 0, k: 0 } },
                    { ty: "fl", nm: "fill", c: { a: 0, k: c.slice(0, 3) }, o: { a: 0, k: (c[3] ?? 1) * 100 }, r: 1 },
                    { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
                ],
            },
        ],
        ip: 0,
        op: frames,
        st: 0,
        bm: 0,
    };
}
/** Convert one design page into a Lottie animation document. Static (un-animated)
 *  nodes are still emitted as layers with constant transforms, so the exported
 *  Lottie is a faithful, self-contained render of the page. */
function designPageToLottie(file, pageIndex, opts = {}) {
    const page = file.pages[pageIndex];
    if (!page)
        throw new Error("designPageToLottie: page out of range");
    const fps = Math.max(1, Math.round(opts.fps ?? 30));
    // Default duration: longest animated window, or one second if nothing animates.
    let durMs = opts.durationMs;
    if (durMs === undefined) {
        let total = 0;
        const scan = (nodes) => {
            for (const n of nodes) {
                if (isAnimated(n)) {
                    const anim = n.animation;
                    const entEnd = (0, engine_1.clipEnd)(anim?.entrance);
                    let end = entEnd;
                    if (anim?.emphasis)
                        end = Math.max(end, entEnd + (0, engine_1.clipEnd)(anim.emphasis));
                    if (anim?.custom)
                        end = Math.max(end, entEnd + anim.custom.durationMs);
                    if (n.type === "image" && n.motion)
                        end = Math.max(end, 2000);
                    total = Math.max(total, end);
                }
                const kids = (0, schema_1.childrenOf)(n);
                if (kids.length)
                    scan(kids);
            }
        };
        scan(page.children);
        durMs = total || 1000;
    }
    const frames = Math.max(1, Math.round((durMs / 1000) * fps));
    // Flatten the page into draw order (Lottie has no nesting here; children are
    // baked with their own transforms). First layer renders on top in Lottie, so
    // reverse the natural back-to-front order.
    const flat = [];
    const collect = (nodes) => {
        for (const n of nodes) {
            flat.push(n);
            const kids = (0, schema_1.childrenOf)(n);
            if (kids.length)
                collect(kids);
        }
    };
    collect(page.children);
    const layers = [];
    let ind = 1;
    for (let i = flat.length - 1; i >= 0; i--) {
        layers.push(layerFor(flat[i], ind++, frames, fps));
    }
    return {
        v: "5.7.0",
        fr: fps,
        ip: 0,
        op: frames,
        w: Math.round(page.width ?? 1920),
        h: Math.round(page.height ?? 1080),
        nm: page.name ?? `page-${pageIndex + 1}`,
        ddd: 0,
        assets: [],
        layers,
    };
}
