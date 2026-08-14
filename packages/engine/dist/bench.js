"use strict";
// Rendering performance harness. Times the CPU-side cost of
// the Canvas2D render path - scene build, world transforms, dirty-rect, and the
// per-node draw-call dispatch - against a no-op context, so it measures engine
// throughput independent of the actual rasterizer/GPU. It gives a baseline for
// the 60fps/1000-element target and a regression guard, and a yardstick for the
// future WebGL/WebGPU path. Pure + headless: runs in Node, a worker, or a test.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNullContext = createNullContext;
exports.benchmarkSceneBuild = benchmarkSceneBuild;
exports.benchmarkRender = benchmarkRender;
const scene_1 = require("./scene");
const render2d_1 = require("./render2d");
const NULL_GRADIENT = { addColorStop: () => { } };
/** A CanvasLike that does nothing: every draw call is a no-op and every state
 *  setter is ignored. Lets the benchmark exercise the full render traversal and
 *  call dispatch without a real rasterizer. */
function createNullContext() {
    const noop = () => { };
    return {
        save: noop, restore: noop,
        setTransform: noop, transform: noop,
        clearRect: noop, fillRect: noop, strokeRect: noop,
        beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
        bezierCurveTo: noop, quadraticCurveTo: noop, rect: noop, roundRect: noop, ellipse: noop,
        fill: noop, stroke: noop, clip: noop,
        fillText: noop, strokeText: noop,
        drawImage: noop,
        createLinearGradient: () => NULL_GRADIENT,
        createRadialGradient: () => NULL_GRADIENT,
        createConicGradient: () => NULL_GRADIENT,
        measureText: (t) => ({ width: t.length * 8 }),
        lineJoin: "miter",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        fillStyle: "#000",
        strokeStyle: "#000",
        lineWidth: 1,
        font: "16px sans-serif",
        textAlign: "left",
        filter: "none",
        shadowColor: "rgba(0,0,0,0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    };
}
/** Scene-build (load) cost for a multi-page design: builds every page's scene
 *  graph once and reports the total + per-page mean. This is the SCALE/load
 *  number (a 50-page design materializes every page into the one Y.Doc today, no
 *  subdocuments), distinct from the per-frame render cost which only touches the
 *  open page. Like benchmarkRender it measures CPU only (no rasterizer). */
function benchmarkSceneBuild(file, opts = {}) {
    const now = opts.now ?? defaultNow;
    const pages = file.pages.length;
    const t0 = now();
    for (let i = 0; i < pages; i++)
        (0, scene_1.createScene)(file, i);
    const totalMs = now() - t0;
    return { pages, totalMs, perPageMs: totalMs / Math.max(1, pages) };
}
const defaultNow = typeof performance !== "undefined" ? () => performance.now() : () => Date.now();
/** Render `file` repeatedly against a null context and report frame timings.
 *  Benches the page at `opts.pageIndex` (default 0); the editor only paints the
 *  current page per frame, so this is the 60fps-relevant per-frame cost. */
function benchmarkRender(file, opts = {}) {
    const frames = opts.frames ?? 60;
    const warmup = opts.warmup ?? 5;
    const now = opts.now ?? defaultNow;
    const pageIndex = opts.pageIndex ?? 0;
    const page = file.pages[pageIndex];
    const viewport = {
        zoom: 1, panX: 0, panY: 0, dpr: 1,
        width: page?.width ?? 1920, height: page?.height ?? 1080,
        ...opts.viewport,
    };
    const ctx = createNullContext();
    const scene = (0, scene_1.createScene)(file, pageIndex);
    for (let i = 0; i < warmup; i++)
        (0, render2d_1.renderScene)(scene, ctx, viewport);
    let total = 0, minMs = Infinity, maxMs = 0;
    for (let i = 0; i < frames; i++) {
        const t0 = now();
        (0, render2d_1.renderScene)(scene, ctx, viewport);
        const dt = now() - t0;
        total += dt;
        if (dt < minMs)
            minMs = dt;
        if (dt > maxMs)
            maxMs = dt;
    }
    const avgMs = total / Math.max(1, frames);
    return {
        nodeCount: page?.children.length ?? 0,
        frames,
        avgMs,
        minMs: minMs === Infinity ? 0 : minMs,
        maxMs,
        fps: avgMs > 0 ? 1000 / avgMs : Infinity,
    };
}
