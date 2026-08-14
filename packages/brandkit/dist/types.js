"use strict";
// Brand-governance core types (FR-6, FR-7, FR-8, FR-10). These
// describe the minimal brand-kit shape the pure linter needs, plus the violation
// and applyable-fix model. The backend BrandKit (its service `types.ts`) and the
// @hc/sdk BrandKit both structurally satisfy `LintBrandKit`, so a single linter
// runs unchanged on the client (live lint) and the server (the export/publish
// gate). No IO, no React, no Nest: pure functions over a DesignFile + a kit.
Object.defineProperty(exports, "__esModule", { value: true });
