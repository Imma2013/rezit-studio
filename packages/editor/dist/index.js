"use strict";
// @hc/editor - the framework-agnostic editor controller for object manipulation
//: selection, transforms, snapping, align/distribute, grouping, layer
// state, and reversible edit commands. It consumes @hc/schema (the scene graph)
// and @hc/engine (hit-testing, matrices), with no React/UI dependency. The web
// editor (gizmo, gestures, layer panel, Zustand bindings) binds to this core;
// that UI plus Playwright/visual/perf tests land with the editor app.
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
__exportStar(require("./tree"), exports);
__exportStar(require("./transform"), exports);
__exportStar(require("./commands"), exports);
__exportStar(require("./expression"), exports);
__exportStar(require("./selection"), exports);
__exportStar(require("./snapping"), exports);
__exportStar(require("./arrange"), exports);
__exportStar(require("./grouping"), exports);
__exportStar(require("./layers"), exports);
__exportStar(require("./image"), exports);
__exportStar(require("./resize"), exports);
__exportStar(require("./history"), exports);
__exportStar(require("./registry"), exports);
__exportStar(require("./clipboard"), exports);
