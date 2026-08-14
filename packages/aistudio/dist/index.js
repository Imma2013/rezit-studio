"use strict";
// @hc/aistudio: F39 AI Creative Studio core. Framework-agnostic, pure functions.
// The model returns a validated AiDesignSpec (content + roles + layout intent);
// layoutDesign turns it into a positioned page; qualityCheck verifies the result.
// No React, no network, no DOM - safe in browser, worker, and on the server.
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
__exportStar(require("./spec"), exports);
__exportStar(require("./layout"), exports);
__exportStar(require("./quality"), exports);
__exportStar(require("./outline"), exports);
__exportStar(require("./theme"), exports);
__exportStar(require("./deck"), exports);
__exportStar(require("./prompts"), exports);
__exportStar(require("./assistant"), exports);
__exportStar(require("./transform"), exports);
