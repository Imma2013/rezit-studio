export type EmbedProvider = "youtube" | "vimeo" | "spotify" | "figma" | "google-maps" | "generic";
/** Best-effort provider classification from the URL host. */
export declare function classifyEmbed(url: string): EmbedProvider;
export interface EmbedValidation {
    ok: boolean;
    provider?: EmbedProvider;
    reason?: string;
}
export interface EmbedOptions {
    /** Allow generic (non-known-provider) URLs through (sanitized iframe). */
    allowGeneric?: boolean;
}
/**
 * Validate an embed URL: it must pass the SSRF guard (https, public host), and
 * either resolve to a known provider or be explicitly allowed as generic.
 */
export declare function validateEmbedUrl(url: string, opts?: EmbedOptions): EmbedValidation;
