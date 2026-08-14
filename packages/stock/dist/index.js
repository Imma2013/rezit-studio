"use strict";
// @hc/stock: framework-agnostic stock/elements catalog core for HyCanvas
//. Pure logic only: catalog search/filter, SVG-to-editable-vector
// conversion, stock-to-node insertion mapping with provenance, attribution
// compilation, mini-app scope enforcement, embed provider classification, and
// the QR node model. The REST catalog, CDN, pgvector similarity, sandboxed
// mini-app runtime, and server QR/map/oEmbed rendering are deferred.
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
__exportStar(require("./search"), exports);
__exportStar(require("./pathdata"), exports);
__exportStar(require("./svg"), exports);
__exportStar(require("./insert"), exports);
__exportStar(require("./attribution"), exports);
__exportStar(require("./apphost"), exports);
__exportStar(require("./embed"), exports);
__exportStar(require("./qr"), exports);
__exportStar(require("./qrmatrix"), exports);
