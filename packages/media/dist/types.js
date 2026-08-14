"use strict";
// Media-management data model. These mirror the Postgres
// rows and API payloads, but the types and the logic over them are pure and
// framework-agnostic. Persistence, the ingest pipeline, importers, and the
// REST/realtime surface are the backend/worker layer (deferred).
Object.defineProperty(exports, "__esModule", { value: true });
