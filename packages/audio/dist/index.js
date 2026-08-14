"use strict";
// @hc/audio - pure, framework-agnostic audio mixing math and the ducking
// automation solver for the HyCanvas video editor. No real DSP,
// decoding, or I/O: this package computes gains, fade envelopes, mute/solo
// audibility, and a deterministic sidechain-ducking curve from integer-frame
// timeline data. Used by the editor mixer UI and the headless export audio path.
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
__exportStar(require("./fade"), exports);
__exportStar(require("./mix"), exports);
__exportStar(require("./ducking"), exports);
