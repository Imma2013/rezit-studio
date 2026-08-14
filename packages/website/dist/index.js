"use strict";
// @hc/website - pure-logic core for the F34 website builder.
// Framework-agnostic site model, navigation/link resolution, form validation
// and HTML/CSV emission, SEO/sitemap/robots generation, the immutable-release
// model, and the crown-jewel scene-graph -> responsive static HTML/CSS exporter.
// No canvas/React dependency: it relies only on @hc/schema and @hc/color.
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
exports.fillToCss = exports.colorToCss = exports.escapeAttr = exports.escapeHtml = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./nav"), exports);
__exportStar(require("./forms"), exports);
__exportStar(require("./seo"), exports);
__exportStar(require("./render"), exports);
__exportStar(require("./release"), exports);
var html_1 = require("./html");
Object.defineProperty(exports, "escapeHtml", { enumerable: true, get: function () { return html_1.escapeHtml; } });
Object.defineProperty(exports, "escapeAttr", { enumerable: true, get: function () { return html_1.escapeAttr; } });
Object.defineProperty(exports, "colorToCss", { enumerable: true, get: function () { return html_1.colorToCss; } });
Object.defineProperty(exports, "fillToCss", { enumerable: true, get: function () { return html_1.fillToCss; } });
