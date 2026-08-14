"use strict";
// @hc/engine - the rendering engine. Framework-agnostic (no React/Next
// dependency) so it runs in the browser, in OffscreenCanvas workers, and
// headless on the server. It turns a scene graph into pixels and answers
// hit-tests for selection.
//
// Implemented now: scene graph + world transforms, viewport (fit/fill/1:1,
// page<->screen), hit-testing (point + marquee), dirty-rect tiling, and the
// Canvas2D render path (browser/worker/headless via any conforming 2D context).
// Deferred (Section 14): the GPU path (WebGL2/WebGPU), the OffscreenCanvas
// worker protocol, skia-canvas server pixel-parity, and the 60fps benchmark.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpuAvailable = exports.probeContext = exports.render = exports.mountRenderer = exports.DEFAULT_SLIDE_HOLD_MS = exports.visibleSlideIndices = exports.slideDurationMs = exports.planDurationMs = exports.planDeckFrames = exports.startModeLabel = exports.childIndexForBuildOrder = exports.planBuildOrder = exports.lerpNode = exports.morphHiddenIds = exports.morphDesignAt = exports.morphPlan = exports.renderTransition = exports.revealEntranceText = exports.sequenceStarts = exports.pageAnimationDuration = exports.poseDesignAt = exports.createNullContext = exports.benchmarkRender = exports.blendToComposite = exports.bumpTextLayout = exports.renderScene = exports.pointInLocalShape = exports.SpatialIndex = exports.effectBleed = exports.createScene = exports.maskingAvailable = exports.clearMaskCache = exports.maskedCanvas = exports.clearDuotoneCache = exports.duotoneCanvas = exports.luminance601 = exports.applyDuotone = exports.duotoneLut = exports.duotoneEffect = exports.adjustmentOpToFilters = exports.outlineSpecs = exports.effectsFilter = exports.resolveFill = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./math"), exports);
__exportStar(require("./viewport"), exports);
__exportStar(require("./tiles"), exports);
__exportStar(require("./color"), exports);
__exportStar(require("./fonts"), exports);
__exportStar(require("./image"), exports);
__exportStar(require("./booleanGeom"), exports);
__exportStar(require("./animation"), exports);
__exportStar(require("./chart"), exports);
var fills_1 = require("./fills");
Object.defineProperty(exports, "resolveFill", { enumerable: true, get: function () { return fills_1.resolveFill; } });
var effects_1 = require("./effects");
Object.defineProperty(exports, "effectsFilter", { enumerable: true, get: function () { return effects_1.effectsFilter; } });
Object.defineProperty(exports, "outlineSpecs", { enumerable: true, get: function () { return effects_1.outlineSpecs; } });
Object.defineProperty(exports, "adjustmentOpToFilters", { enumerable: true, get: function () { return effects_1.adjustmentOpToFilters; } });
Object.defineProperty(exports, "duotoneEffect", { enumerable: true, get: function () { return effects_1.duotoneEffect; } });
Object.defineProperty(exports, "duotoneLut", { enumerable: true, get: function () { return effects_1.duotoneLut; } });
Object.defineProperty(exports, "applyDuotone", { enumerable: true, get: function () { return effects_1.applyDuotone; } });
Object.defineProperty(exports, "luminance601", { enumerable: true, get: function () { return effects_1.luminance601; } });
var duotone_1 = require("./duotone");
Object.defineProperty(exports, "duotoneCanvas", { enumerable: true, get: function () { return duotone_1.duotoneCanvas; } });
Object.defineProperty(exports, "clearDuotoneCache", { enumerable: true, get: function () { return duotone_1.clearDuotoneCache; } });
var maskedImage_1 = require("./maskedImage");
Object.defineProperty(exports, "maskedCanvas", { enumerable: true, get: function () { return maskedImage_1.maskedCanvas; } });
Object.defineProperty(exports, "clearMaskCache", { enumerable: true, get: function () { return maskedImage_1.clearMaskCache; } });
Object.defineProperty(exports, "maskingAvailable", { enumerable: true, get: function () { return maskedImage_1.maskingAvailable; } });
var scene_1 = require("./scene");
Object.defineProperty(exports, "createScene", { enumerable: true, get: function () { return scene_1.createScene; } });
Object.defineProperty(exports, "effectBleed", { enumerable: true, get: function () { return scene_1.effectBleed; } });
var spatial_1 = require("./spatial");
Object.defineProperty(exports, "SpatialIndex", { enumerable: true, get: function () { return spatial_1.SpatialIndex; } });
var hit_1 = require("./hit");
Object.defineProperty(exports, "pointInLocalShape", { enumerable: true, get: function () { return hit_1.pointInLocalShape; } });
var render2d_1 = require("./render2d");
Object.defineProperty(exports, "renderScene", { enumerable: true, get: function () { return render2d_1.renderScene; } });
Object.defineProperty(exports, "bumpTextLayout", { enumerable: true, get: function () { return render2d_1.bumpTextLayout; } });
Object.defineProperty(exports, "blendToComposite", { enumerable: true, get: function () { return render2d_1.blendToComposite; } });
var bench_1 = require("./bench");
Object.defineProperty(exports, "benchmarkRender", { enumerable: true, get: function () { return bench_1.benchmarkRender; } });
Object.defineProperty(exports, "createNullContext", { enumerable: true, get: function () { return bench_1.createNullContext; } });
var pose_1 = require("./pose");
Object.defineProperty(exports, "poseDesignAt", { enumerable: true, get: function () { return pose_1.poseDesignAt; } });
Object.defineProperty(exports, "pageAnimationDuration", { enumerable: true, get: function () { return pose_1.pageAnimationDuration; } });
Object.defineProperty(exports, "sequenceStarts", { enumerable: true, get: function () { return pose_1.sequenceStarts; } });
Object.defineProperty(exports, "revealEntranceText", { enumerable: true, get: function () { return pose_1.revealEntranceText; } });
var transition_1 = require("./transition");
Object.defineProperty(exports, "renderTransition", { enumerable: true, get: function () { return transition_1.renderTransition; } });
Object.defineProperty(exports, "morphPlan", { enumerable: true, get: function () { return transition_1.morphPlan; } });
Object.defineProperty(exports, "morphDesignAt", { enumerable: true, get: function () { return transition_1.morphDesignAt; } });
Object.defineProperty(exports, "morphHiddenIds", { enumerable: true, get: function () { return transition_1.morphHiddenIds; } });
Object.defineProperty(exports, "lerpNode", { enumerable: true, get: function () { return transition_1.lerpNode; } });
var buildorder_1 = require("./buildorder");
Object.defineProperty(exports, "planBuildOrder", { enumerable: true, get: function () { return buildorder_1.planBuildOrder; } });
Object.defineProperty(exports, "childIndexForBuildOrder", { enumerable: true, get: function () { return buildorder_1.childIndexForBuildOrder; } });
Object.defineProperty(exports, "startModeLabel", { enumerable: true, get: function () { return buildorder_1.startModeLabel; } });
var deck_1 = require("./deck");
Object.defineProperty(exports, "planDeckFrames", { enumerable: true, get: function () { return deck_1.planDeckFrames; } });
Object.defineProperty(exports, "planDurationMs", { enumerable: true, get: function () { return deck_1.planDurationMs; } });
Object.defineProperty(exports, "slideDurationMs", { enumerable: true, get: function () { return deck_1.slideDurationMs; } });
Object.defineProperty(exports, "visibleSlideIndices", { enumerable: true, get: function () { return deck_1.visibleSlideIndices; } });
Object.defineProperty(exports, "DEFAULT_SLIDE_HOLD_MS", { enumerable: true, get: function () { return deck_1.DEFAULT_SLIDE_HOLD_MS; } });
var renderer_1 = require("./renderer");
Object.defineProperty(exports, "mountRenderer", { enumerable: true, get: function () { return renderer_1.mountRenderer; } });
Object.defineProperty(exports, "render", { enumerable: true, get: function () { return renderer_1.render; } });
Object.defineProperty(exports, "probeContext", { enumerable: true, get: function () { return renderer_1.probeContext; } });
Object.defineProperty(exports, "gpuAvailable", { enumerable: true, get: function () { return renderer_1.gpuAvailable; } });
