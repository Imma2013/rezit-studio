"use strict";
// @hc/authz: framework-agnostic authorization + identity core for HyCanvas.
// Pure logic only: workspace roles + per-workspace isolation, identity linking
// by verified email, refresh-token rotation/reuse detection, invitation
// validation, workspace lifecycle invariants, and universal-search ranking.
// The Go backend's auth module and Postgres persistence build on this core;
// OIDC SSO and MFA ship, while SAML/SCIM/WebAuthn/LTI remain on the roadmap.
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
__exportStar(require("./roles"), exports);
__exportStar(require("./access"), exports);
__exportStar(require("./identity"), exports);
__exportStar(require("./session"), exports);
__exportStar(require("./invitation"), exports);
__exportStar(require("./workspace"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./totp"), exports);
