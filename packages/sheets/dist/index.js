"use strict";
// @hc/sheets - framework-agnostic sheet model for HyCanvas Sheets
// (FR-1/5/6/7). A sheet lives in a Design's `meta.kind === "sheet"`; cells are
// NOT scene nodes. This package provides the cell model, formula recompute
// (via @hc/formula), number/conditional formatting, data tables, and the
// chart-binding resolver that feeds a chart scene node (F27).
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
__exportStar(require("./model"), exports);
__exportStar(require("./recompute"), exports);
__exportStar(require("./format"), exports);
__exportStar(require("./table"), exports);
__exportStar(require("./binding"), exports);
__exportStar(require("./structure"), exports);
