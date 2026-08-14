/**
 * Generate a fresh TOTP secret as a base32 string (default 20 bytes / 160 bits,
 * the RFC 6238 reference size). This is the value to encrypt at rest and to
 * embed in the otpauth:// enrollment URL.
 */
export declare function generateTotpSecret(bytes?: number): string;
/**
 * Compute the current TOTP code for a base32 secret (RFC 6238: HMAC-SHA1, 6
 * digits, 30s step). `time` is ms epoch and defaults to now; pass it explicitly
 * to make tests deterministic.
 */
export declare function totp(secret: string, time?: number): string;
/**
 * Verify a submitted code against the secret, accepting codes within `window`
 * steps on either side of now (default +/-1 step, i.e. +/-30s) to tolerate
 * clock skew. Returns true on the first matching step.
 */
export declare function verifyTotp(secret: string, code: string, window?: number, time?: number): boolean;
/**
 * Generate `n` single-use recovery codes (default 10). Each is a grouped,
 * easy-to-read string like "abcd-efgh-ijkl"; the caller hashes these before
 * storage and shows the plaintext to the user exactly once.
 */
export declare function generateRecoveryCodes(n?: number): string[];
/** Normalize a recovery code for comparison/hashing (lowercase, no separators). */
export declare function normalizeRecoveryCode(code: string): string;
/**
 * Build the otpauth:// URI authenticator apps consume (rendered as a QR by the
 * client). `label` is usually the account email; `issuer` the product name.
 */
export declare function otpauthUrl(secret: string, label: string, issuer: string): string;
