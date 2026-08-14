"use strict";
// Stock/elements catalog data model. The catalog is global
// (not workspace-scoped); favorites/recents are per user per workspace. The
// types and the logic over them are pure; the REST surface, CDN, pgvector
// similarity, and mini-app sandbox runtime are the backend/runtime layer.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVENANCE_KEY = void 0;
/** The data key under which NodeProvenance is serialized on a node. */
exports.PROVENANCE_KEY = "provenance";
