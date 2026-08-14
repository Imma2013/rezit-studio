"use strict";
// @hc/media: framework-agnostic media-management core for HyCanvas.
// Pure logic only: magic-byte type sniffing, perceptual hashing + duplicate
// classification, storage-quota accounting, asset status transitions, folder
// trees, source-import fidelity reports, SSRF URL validation, and asset search.
// The ingest pipeline, importers, REST/realtime surface, persistence, OAuth
// connectors, and recorders are the backend/worker/runtime layer (deferred).
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
__exportStar(require("./sniff"), exports);
__exportStar(require("./phash"), exports);
__exportStar(require("./dedupe"), exports);
__exportStar(require("./quota"), exports);
__exportStar(require("./status"), exports);
__exportStar(require("./folders"), exports);
__exportStar(require("./fidelity"), exports);
__exportStar(require("./ssrf"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./matte"), exports);
__exportStar(require("./ingest"), exports);
__exportStar(require("./similar"), exports);
