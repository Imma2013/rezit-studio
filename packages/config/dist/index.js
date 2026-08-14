"use strict";
// @hc/config - typed, validated environment configuration shared across services.
// Reads from process.env (loaded from the root .env).
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWebPushConfigured = isWebPushConfigured;
exports.resolveStorageDriver = resolveStorageDriver;
exports.isRedisConfigured = isRedisConfigured;
exports.resolveJobQueueDriver = resolveJobQueueDriver;
exports.loadConfig = loadConfig;
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: zod_1.z.string().url(),
    PORT: zod_1.z.coerce.number().default(8005),
    FRONTEND_URL: zod_1.z.string().url().default("http://localhost:3000"),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
    // Public base URL of the web app, used to build the links in outbound email
    // (verify/reset/magic). Defaults to the backend URL for single-process dev.
    APP_URL: zod_1.z.string().url().default("http://localhost:8005"),
    // Outbound email (SMTP). When SMTP_HOST is unset the app uses the in-memory
    // DevMailer (no external server needed for local development). When set, mail
    // is sent over SMTP. SMTP_USER/SMTP_PASS are optional (open relays / dev MTAs
    // such as MailHog need no auth).
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().default(587),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    // Coerce from the env string: only the literal "true" is truthy (so an empty
    // or "false" value stays false, unlike a bare z.coerce.boolean()).
    SMTP_SECURE: zod_1.z
        .string()
        .optional()
        .transform((v) => v === "true"),
    SMTP_FROM: zod_1.z.string().default("HyCanvas <no-reply@localhost>"),
    // Web push. The VAPID key pair is OPTIONAL: web push is enabled
    // only when BOTH keys are set (generate with `npx web-push generate-vapid-keys`);
    // otherwise the push channel is a no-op, like the DevMailer for email. The
    // subject is a mailto:/https: contact the push service can reach (RFC 8292).
    VAPID_PUBLIC_KEY: zod_1.z.string().optional(),
    VAPID_PRIVATE_KEY: zod_1.z.string().optional(),
    VAPID_SUBJECT: zod_1.z.string().default("mailto:admin@localhost"),
    REDIS_HOST: zod_1.z.string().default("localhost"),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    REDIS_PASSWORD: zod_1.z.string().optional().default(""),
    REDIS_URL: zod_1.z.string().optional(),
    // Background job queue: when QUEUE_DRIVER is unset it DEFAULTS to "inline" (an
    // in-process driver that runs jobs synchronously, needing no Redis for dev or
    // tests). Set QUEUE_DRIVER="bull" to opt into the BullMQ + Redis backend.
    QUEUE_DRIVER: zod_1.z.enum(["inline", "bull"]).optional(),
    // Storage: when STORAGE_DRIVER is unset, it is auto-detected -> "s3" if S3 is
    // configured (endpoint + credentials), otherwise "local" filesystem storage.
    STORAGE_DRIVER: zod_1.z.enum(["local", "s3"]).optional(),
    LOCAL_STORAGE_PATH: zod_1.z.string().default(".data/storage"),
    S3_ENDPOINT: zod_1.z.string().optional(),
    S3_REGION: zod_1.z.string().default("us-east-1"),
    S3_BUCKET: zod_1.z.string().default("hycanvas"),
    S3_ACCESS_KEY_ID: zod_1.z.string().optional(),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    S3_FORCE_PATH_STYLE: zod_1.z
        .string()
        .optional()
        .transform((v) => v === "true"),
});
/**
 * True when S3-compatible storage is fully configured (endpoint + credentials).
 * Without all three, there is nothing to talk to, so we cannot use S3.
 */
function isS3Configured(config) {
    return Boolean(config.S3_ENDPOINT && config.S3_ACCESS_KEY_ID && config.S3_SECRET_ACCESS_KEY);
}
/**
 * True when web push is fully configured: both VAPID keys are present. Without
 * the pair there is no way to sign push payloads, so the channel stays a no-op
 * (dev/local works with no keys), mirroring the SMTP-less DevMailer fallback.
 */
function isWebPushConfigured(config) {
    return Boolean(config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY);
}
/**
 * The effective storage driver. Honors an explicit STORAGE_DRIVER; otherwise
 * uses S3 when it is configured and falls back to the local filesystem when it
 * is not. Throws if STORAGE_DRIVER="s3" but S3 is not configured.
 */
function resolveStorageDriver(config) {
    if (config.STORAGE_DRIVER === "s3") {
        if (!isS3Configured(config)) {
            throw new Error('STORAGE_DRIVER="s3" but S3 is not configured (set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY).');
        }
        return "s3";
    }
    if (config.STORAGE_DRIVER === "local") {
        return "local";
    }
    return isS3Configured(config) ? "s3" : "local";
}
/**
 * True when a Redis connection is available to back the job queue: either an
 * explicit REDIS_URL is set, or the queue is explicitly switched to BullMQ
 * (which connects via REDIS_HOST/REDIS_PORT, both of which have defaults).
 */
function isRedisConfigured(config) {
    return Boolean(config.REDIS_URL) || config.QUEUE_DRIVER === "bull";
}
/**
 * The effective job-queue driver. Honors an explicit QUEUE_DRIVER; otherwise
 * DEFAULTS to the in-process "inline" driver (no Redis needed). Unlike storage,
 * a Redis host is never auto-detected: REDIS_HOST always defaults to localhost,
 * so BullMQ must be opted into explicitly with QUEUE_DRIVER="bull".
 */
function resolveJobQueueDriver(config) {
    if (config.QUEUE_DRIVER === "bull") {
        return "bull";
    }
    // "inline" explicitly, or unset -> default to the zero-config in-process driver.
    return "inline";
}
/** Validate and return typed config. Throws with a clear message if the environment is invalid. */
function loadConfig(env = process.env) {
    const parsed = EnvSchema.safeParse(env);
    if (!parsed.success) {
        throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
    }
    return parsed.data;
}
