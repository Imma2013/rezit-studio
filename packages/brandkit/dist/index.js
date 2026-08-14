"use strict";
// @hc/brandkit: framework-agnostic brand-governance core for HyCanvas.
// A pure brand linter that runs unchanged in the editor (live + on
// demand) and on the server (the pre-export/publish gate), plus the violation
// and applyable-fix model. No IO, no React, no Nest. The brand KIT storage,
// versioning, pin/track, and locked-region template wiring live in the backend +
// app; this package owns only the rules.
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
__exportStar(require("./lint"), exports);
__exportStar(require("./gate"), exports);
