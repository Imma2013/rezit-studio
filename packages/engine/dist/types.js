"use strict";
// Public runtime types for @hc/engine. None are persisted;
// the engine only reads the scene-model file format and produces pixels + hit results.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    preferGpu: true,
    tileSize: 256,
    maxTextureSize: 4096,
    interactionQuality: "adaptive",
};
