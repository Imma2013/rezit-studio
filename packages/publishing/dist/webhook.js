"use strict";
// Outbound webhook signing/verification (FR-16). Uses node:crypto's HMAC-SHA256,
// which is deterministic and dependency-free. The signature covers the request
// timestamp and the raw body so replay/tamper can be detected by subscribers.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBHOOK_EVENTS = void 0;
exports.signPayload = signPayload;
exports.verifySignature = verifySignature;
const node_crypto_1 = require("node:crypto");
/** Lifecycle event names delivered to webhook subscribers. */
exports.WEBHOOK_EVENTS = {
    postPublished: "post.published",
    postFailed: "post.failed",
    postScheduled: "post.scheduled",
    insightsUpdated: "insights.updated",
};
/**
 * Compute the hex HMAC-SHA256 signature over `${timestamp}.${bodyString}` using
 * the per-webhook secret. The timestamp binds the signature to a moment so a
 * captured payload cannot be replayed indefinitely (subscribers reject old
 * timestamps).
 */
function signPayload(secret, bodyString, timestamp) {
    const signed = `${timestamp}.${bodyString}`;
    return (0, node_crypto_1.createHmac)("sha256", secret).update(signed).digest("hex");
}
/**
 * Constant-time verification of a signature produced by signPayload. Returns
 * false (never throws) on any mismatch, including malformed/length-mismatched
 * signatures.
 */
function verifySignature(secret, bodyString, timestamp, signature) {
    const expected = signPayload(secret, bodyString, timestamp);
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length)
        return false;
    return (0, node_crypto_1.timingSafeEqual)(a, b);
}
