"use strict";
// Template system data model. A template is a stored
// DesignFile snapshot plus this metadata; no new persisted node type is added,
// so the open file format stays unchanged and templates round-trip losslessly.
// The catalog persistence, marketplace, AI matching, and preview rendering are
// the backend/runtime layer (deferred).
Object.defineProperty(exports, "__esModule", { value: true });
