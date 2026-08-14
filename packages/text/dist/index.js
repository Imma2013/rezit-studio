"use strict";
// @hc/text - the framework-agnostic text engine for HyCanvas: the
// rich-text document model helpers, the style cascade, Unicode segmentation,
// find/replace, line-breaking layout, and auto-fit. Consumed by the editor and
// the headless export path so on-screen and exported text agree.
//
// Implemented now: model + cascade + segmentation + rich-text ops + a pluggable
// line-break layout + auto-fit. Deferred (need a browser/native runtime or heavy
// deps): HarfBuzz shaping, bidi + complex-script (Arabic/Indic/Thai/CJK)
// correctness, real font metrics/loading, spell/grammar, text effects rendering,
// the inline editing UI + IME, and golden-image export parity.
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
__exportStar(require("./defaults"), exports);
__exportStar(require("./fonts"), exports);
__exportStar(require("./cascade"), exports);
__exportStar(require("./segment"), exports);
__exportStar(require("./richtext"), exports);
__exportStar(require("./bidi"), exports);
__exportStar(require("./layout"), exports);
__exportStar(require("./autofit"), exports);
