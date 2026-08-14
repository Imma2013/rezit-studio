/** Lifecycle event names delivered to webhook subscribers. */
export declare const WEBHOOK_EVENTS: {
    readonly postPublished: "post.published";
    readonly postFailed: "post.failed";
    readonly postScheduled: "post.scheduled";
    readonly insightsUpdated: "insights.updated";
};
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[keyof typeof WEBHOOK_EVENTS];
/**
 * Compute the hex HMAC-SHA256 signature over `${timestamp}.${bodyString}` using
 * the per-webhook secret. The timestamp binds the signature to a moment so a
 * captured payload cannot be replayed indefinitely (subscribers reject old
 * timestamps).
 */
export declare function signPayload(secret: string, bodyString: string, timestamp: number | string): string;
/**
 * Constant-time verification of a signature produced by signPayload. Returns
 * false (never throws) on any mismatch, including malformed/length-mismatched
 * signatures.
 */
export declare function verifySignature(secret: string, bodyString: string, timestamp: number | string, signature: string): boolean;
