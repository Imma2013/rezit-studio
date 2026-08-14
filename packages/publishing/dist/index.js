"use strict";
// @hc/publishing - pure, framework-agnostic core for F33 (Publishing and
// scheduling): the post lifecycle state machine and timezone-offset scheduling
// math, the content-calendar planner, caption/hashtag helpers with per-platform
// validation, render-variant dedup and multi-platform sizing, a byte-mode QR
// encoder + SVG renderer, insights aggregation, and HMAC webhook signing.
// No network, no clock access (time arrives as explicit parameters).
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
__exportStar(require("./schedule"), exports);
__exportStar(require("./planner"), exports);
__exportStar(require("./caption"), exports);
__exportStar(require("./variants"), exports);
__exportStar(require("./qr"), exports);
__exportStar(require("./insights"), exports);
__exportStar(require("./webhook"), exports);
