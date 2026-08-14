import { z } from "zod";
declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    DATABASE_URL: z.ZodString;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    FRONTEND_URL: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    APP_URL: z.ZodDefault<z.ZodString>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASS: z.ZodOptional<z.ZodString>;
    SMTP_SECURE: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
    SMTP_FROM: z.ZodDefault<z.ZodString>;
    VAPID_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
    VAPID_PRIVATE_KEY: z.ZodOptional<z.ZodString>;
    VAPID_SUBJECT: z.ZodDefault<z.ZodString>;
    REDIS_HOST: z.ZodDefault<z.ZodString>;
    REDIS_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    REDIS_PASSWORD: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    QUEUE_DRIVER: z.ZodOptional<z.ZodEnum<{
        inline: "inline";
        bull: "bull";
    }>>;
    STORAGE_DRIVER: z.ZodOptional<z.ZodEnum<{
        local: "local";
        s3: "s3";
    }>>;
    LOCAL_STORAGE_PATH: z.ZodDefault<z.ZodString>;
    S3_ENDPOINT: z.ZodOptional<z.ZodString>;
    S3_REGION: z.ZodDefault<z.ZodString>;
    S3_BUCKET: z.ZodDefault<z.ZodString>;
    S3_ACCESS_KEY_ID: z.ZodOptional<z.ZodString>;
    S3_SECRET_ACCESS_KEY: z.ZodOptional<z.ZodString>;
    S3_FORCE_PATH_STYLE: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
}, z.core.$strip>;
export type AppConfig = z.infer<typeof EnvSchema>;
export type StorageDriver = "local" | "s3";
export type JobQueueDriver = "inline" | "bull";
/**
 * True when web push is fully configured: both VAPID keys are present. Without
 * the pair there is no way to sign push payloads, so the channel stays a no-op
 * (dev/local works with no keys), mirroring the SMTP-less DevMailer fallback.
 */
export declare function isWebPushConfigured(config: AppConfig): boolean;
/**
 * The effective storage driver. Honors an explicit STORAGE_DRIVER; otherwise
 * uses S3 when it is configured and falls back to the local filesystem when it
 * is not. Throws if STORAGE_DRIVER="s3" but S3 is not configured.
 */
export declare function resolveStorageDriver(config: AppConfig): StorageDriver;
/**
 * True when a Redis connection is available to back the job queue: either an
 * explicit REDIS_URL is set, or the queue is explicitly switched to BullMQ
 * (which connects via REDIS_HOST/REDIS_PORT, both of which have defaults).
 */
export declare function isRedisConfigured(config: AppConfig): boolean;
/**
 * The effective job-queue driver. Honors an explicit QUEUE_DRIVER; otherwise
 * DEFAULTS to the in-process "inline" driver (no Redis needed). Unlike storage,
 * a Redis host is never auto-detected: REDIS_HOST always defaults to localhost,
 * so BullMQ must be opted into explicitly with QUEUE_DRIVER="bull".
 */
export declare function resolveJobQueueDriver(config: AppConfig): JobQueueDriver;
/** Validate and return typed config. Throws with a clear message if the environment is invalid. */
export declare function loadConfig(env?: NodeJS.ProcessEnv): AppConfig;
export {};
