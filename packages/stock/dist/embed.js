"use strict";
// Embed app: classify a URL to a known provider and validate it for safe
// embedding. SSRF hardening is shared with the uploads/media URL
// import via @hc/media; unknown providers fall back to a sanitized generic
// iframe only when the host passes allowlist policy.
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyEmbed = classifyEmbed;
exports.validateEmbedUrl = validateEmbedUrl;
const media_1 = require("@hc/media");
const PROVIDER_HOSTS = [
    { provider: "youtube", hosts: ["youtube.com", "youtu.be"] },
    { provider: "vimeo", hosts: ["vimeo.com"] },
    { provider: "spotify", hosts: ["spotify.com", "open.spotify.com"] },
    { provider: "figma", hosts: ["figma.com"] },
    { provider: "google-maps", hosts: ["google.com", "maps.google.com", "goo.gl"] },
];
/** Best-effort provider classification from the URL host. */
function classifyEmbed(url) {
    const parsed = (0, media_1.parseUrl)(url);
    if (!parsed)
        return "generic";
    for (const { provider, hosts } of PROVIDER_HOSTS) {
        if (hosts.some((h) => parsed.host === h || parsed.host.endsWith(`.${h}`)))
            return provider;
    }
    return "generic";
}
/**
 * Validate an embed URL: it must pass the SSRF guard (https, public host), and
 * either resolve to a known provider or be explicitly allowed as generic.
 */
function validateEmbedUrl(url, opts = {}) {
    const ssrf = (0, media_1.validateImportUrl)(url, { allowedSchemes: ["https"] });
    if (!ssrf.ok)
        return { ok: false, reason: ssrf.reason };
    const provider = classifyEmbed(url);
    if (provider === "generic" && !opts.allowGeneric) {
        return { ok: false, provider, reason: "unrecognized embed provider" };
    }
    return { ok: true, provider };
}
