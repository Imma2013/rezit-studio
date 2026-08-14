import type { SocialPlatform } from "./types";
/** Max caption length (characters) per platform. */
export declare const PLATFORM_LIMITS: Record<SocialPlatform, number>;
/**
 * Max number of hashtags per platform where the platform enforces or strongly
 * recommends a cap. Platforms without a meaningful cap are omitted (undefined).
 */
export declare const PLATFORM_MAX_HASHTAGS: Partial<Record<SocialPlatform, number>>;
/**
 * Extract hashtag tokens from free text, in first-seen order, WITHOUT the
 * leading '#'. Duplicates are preserved here (use normalizeHashtags to dedupe).
 */
export declare function extractHashtags(text: string): string[];
/**
 * Normalize a list of tags: strip a leading '#', drop empties, and dedupe
 * case-insensitively while preserving the FIRST-seen casing of each tag.
 */
export declare function normalizeHashtags(tags: readonly string[]): string[];
/**
 * Compose a final caption string: body, then a blank line and the
 * space-separated '#'-prefixed hashtags, then (optionally) a first comment
 * appended after a separator. firstComment is included in the returned string
 * for length estimation but real platforms post it separately; callers that
 * post it natively can pass it through PublishTargetSelection instead.
 */
export declare function composeCaption(body: string, hashtags?: readonly string[], firstComment?: string): string;
export interface CaptionValidation {
    ok: boolean;
    limit: number;
    length: number;
    errors: string[];
}
/**
 * Validate a composed caption for a platform: character limit and (where known)
 * hashtag count. Returns a structured result rather than throwing.
 */
export declare function validateCaption(platform: SocialPlatform, caption: string): CaptionValidation;
