"use strict";
// Accounts/auth/workspace data model. These mirror the Postgres rows and SDK
// payloads; the logic over them in this package is pure. The Go backend's auth
// module and Postgres persistence build on this core; OIDC SSO and MFA ship,
// while SAML/SCIM/LTI and some email flows remain on the roadmap.
Object.defineProperty(exports, "__esModule", { value: true });
