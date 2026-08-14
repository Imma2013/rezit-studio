export interface ParsedUrl {
    scheme: string;
    host: string;
    port?: number;
}
/** Parse scheme and host from a URL string, or null if it is not absolute. */
export declare function parseUrl(url: string): ParsedUrl | null;
/** Whether an IP literal (v4 or v6) is private, loopback, link-local, or reserved. */
export declare function isPrivateIp(host: string): boolean;
export interface SsrfOptions {
    allowedSchemes?: string[];
    /** If set, the host must equal or be a subdomain of an allowlisted host. */
    allowlist?: string[];
}
export interface UrlValidation {
    ok: boolean;
    reason?: string;
    parsed?: ParsedUrl;
}
/** Validate an import URL against the SSRF policy (FR-12). */
export declare function validateImportUrl(url: string, opts?: SsrfOptions): UrlValidation;
