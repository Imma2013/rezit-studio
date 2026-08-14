"use strict";
// @hc/export: framework-agnostic export engine core for HyCanvas.
// Pure logic only: page selection, raster dimension math, filename templating,
// presets, pre-flight, and editable SVG serialization. Binary encoding (PNG/JPG/
// PDF/GIF/APNG/Lottie), job execution, REST, realtime progress, and S3 storage
// are the runtime/worker layer (deferred); they reuse @hc/engine for parity.
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
__exportStar(require("./types"), exports);
__exportStar(require("./pages"), exports);
__exportStar(require("./dimensions"), exports);
__exportStar(require("./filename"), exports);
__exportStar(require("./preset"), exports);
__exportStar(require("./preflight"), exports);
__exportStar(require("./svg"), exports);
__exportStar(require("./apng"), exports);
__exportStar(require("./gif"), exports);
__exportStar(require("./lottie"), exports);
__exportStar(require("./pptx"), exports);
__exportStar(require("./zipstore"), exports);
__exportStar(require("./unzip"), exports);
__exportStar(require("./xml"), exports);
__exportStar(require("./pptximport"), exports);
