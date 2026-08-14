"use strict";
// @hc/templates: framework-agnostic template-system core for HyCanvas
//. Pure logic only: deep-copy/apply, style extraction + swap-styles,
// fillable-field extraction + validation, attribution merge, and search. The
// catalog persistence, marketplace review workflow, AI matching, remix
// generation, and headless preview rendering are the backend/runtime layer
// (deferred); marketplace ranking + faceting is pure and lives here.
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
__exportStar(require("./deepcopy"), exports);
__exportStar(require("./style"), exports);
__exportStar(require("./fillable"), exports);
__exportStar(require("./fill"), exports);
__exportStar(require("./attribution"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./apply"), exports);
__exportStar(require("./lockedregions"), exports);
__exportStar(require("./marketplace"), exports);
