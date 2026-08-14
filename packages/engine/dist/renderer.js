"use strict";
// Renderer lifecycle: capability probe, viewport control, frame painting, and
// coordinate conversion (FR-1, FR-3, FR-12, FR-13). The GPU (WebGL2/WebGPU) and
// OffscreenCanvas-worker paths are deferred; this wires the Canvas2D path and
// the probe/fallback seam so enabling GPU later is additive.
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpuAvailable = gpuAvailable;
exports.probeContext = probeContext;
exports.mountRenderer = mountRenderer;
exports.render = render;
const render2d_1 = require("./render2d");
const viewport_1 = require("./viewport");
const types_1 = require("./types");
/** Whether an accelerated context is usable. GPU paths are deferred, so this is
 *  currently always false and the engine cleanly uses Canvas2D (FR-13, AC-6). */
function gpuAvailable() {
    return false;
}
/** Choose the render context, honoring `preferGpu` and falling back to 2d. */
function probeContext(target, config) {
    if (config.preferGpu && target.context !== "2d" && gpuAvailable()) {
        return target.context;
    }
    return "2d";
}
function activePageSize(scene) {
    const page = scene.file.pages.find((p) => p.id === scene.activePageId) ?? scene.file.pages[0];
    return { width: page.width, height: page.height };
}
class RendererImpl {
    constructor(scene, target, config, assets) {
        this.scene = scene;
        this.target = target;
        this.config = config;
        this.assets = assets;
        this.listeners = {
            frame: [],
            asset: [],
            error: [],
        };
        this.unsubscribeAssets = null;
        this.contextKind = probeContext(target, config);
        const dpr = typeof globalThis !== "undefined" && "devicePixelRatio" in globalThis
            ? globalThis.devicePixelRatio || 1
            : 1;
        this.viewport = (0, viewport_1.defaultViewport)(target.width, target.height, dpr);
        // When an asset resolves, invalidate only the regions of nodes that use it
        // and signal listeners; no full-canvas reflow (FR-11).
        if (this.assets) {
            this.unsubscribeAssets = this.assets.onChange((assetId) => {
                const nodeIds = this.scene.nodesUsingAsset(assetId);
                for (const id of nodeIds)
                    this.scene.markDirty(id);
                this.emit("asset", { assetId, nodeIds });
            });
        }
    }
    getViewport() {
        return { ...this.viewport };
    }
    setViewport(v) {
        const merged = { ...this.viewport, ...v };
        // Guard against a non-positive/non-finite zoom, which would make
        // screenToPage divide by zero and poison every coordinate conversion.
        if (!(merged.zoom > 0) || !isFinite(merged.zoom))
            merged.zoom = this.viewport.zoom;
        this.viewport = merged;
        // A viewport change invalidates the whole surface (FR-4).
        this.scene.invalidateRegion({ x: -Infinity, y: -Infinity, width: Infinity, height: Infinity });
    }
    fit(mode) {
        this.viewport = (0, viewport_1.fit)(this.viewport, activePageSize(this.scene), mode);
    }
    renderFrame(timeMs) {
        const opts = {
            onError: (err, nodeId) => this.emit("error", { err, nodeId }),
            assets: this.assets,
        };
        (0, render2d_1.renderScene)(this.scene, this.target.ctx, this.viewport, opts);
        this.scene.clearDirty();
        this.emit("frame", { timeMs: timeMs ?? 0 });
    }
    pageToScreen(p) {
        return (0, viewport_1.pageToScreen)(this.viewport, p);
    }
    screenToPage(p) {
        return (0, viewport_1.screenToPage)(this.viewport, p);
    }
    renderMiniMap(maxSize) {
        // Best-effort: needs a canvas factory. Available in browser/worker via
        // OffscreenCanvas; returns null headless (Node) where no factory exists.
        const Off = globalThis.OffscreenCanvas;
        if (!Off)
            return null;
        const page = activePageSize(this.scene);
        const scale = Math.min(maxSize.width / page.width, maxSize.height / page.height, 1);
        const canvas = new Off(Math.ceil(page.width * scale), Math.ceil(page.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return null;
        (0, render2d_1.renderScene)(this.scene, ctx, {
            zoom: scale,
            panX: 0,
            panY: 0,
            dpr: 1,
            width: page.width * scale,
            height: page.height * scale,
        });
        return canvas;
    }
    on(event, cb) {
        this.listeners[event].push(cb);
    }
    emit(event, payload) {
        for (const cb of this.listeners[event])
            cb(payload);
    }
    dispose() {
        this.unsubscribeAssets?.();
        this.unsubscribeAssets = null;
        this.listeners.frame = [];
        this.listeners.asset = [];
        this.listeners.error = [];
    }
}
/** Mount a live renderer over a scene and target. An optional asset provider
 *  supplies loaded media/fonts and drives region-invalidation on load (FR-11). */
function mountRenderer(scene, target, config = {}, assets) {
    return new RendererImpl(scene, target, { ...types_1.DEFAULT_CONFIG, ...config }, assets);
}
/** One-shot render (headless export and thumbnails). Renders the full
 *  page at 1:1 unless a viewport is supplied. */
function render(scene, target, opts = {}) {
    const page = activePageSize(scene);
    const viewport = opts.viewport ??
        (0, viewport_1.defaultViewport)(target.width || page.width, target.height || page.height, 1);
    (0, render2d_1.renderScene)(scene, target.ctx, viewport, opts);
}
