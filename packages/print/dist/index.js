"use strict";
// @hc/print: framework-agnostic print and mockups core for HyCanvas (F35).
//
// Pure logic only: the print product catalog and vendor-adapter registry, print
// geometry (bleed/trim/safe-zone, design-to-product fit, quality badge),
// print-grade pre-flight (reusing @hc/export's DPI/gamut/bleed/font pass plus
// print-specific color-space/ICC/safe-zone/overprint checks) with an ordering
// gate, transparent cost quoting, mockup placement geometry, and the order
// lifecycle state machine. Rasterization, PDF/X encoding, network/vendor I/O,
// payment, persistence, and REST live in the runtime/worker layer.
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
__exportStar(require("./address"), exports);
__exportStar(require("./geometry"), exports);
__exportStar(require("./catalog"), exports);
__exportStar(require("./preflight"), exports);
__exportStar(require("./cost"), exports);
__exportStar(require("./mockup"), exports);
__exportStar(require("./order"), exports);
