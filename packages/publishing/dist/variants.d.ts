import type { SocialPlatform } from "./types";
export type VariantFormat = "png" | "jpg" | "mp4";
export interface PlatformFormat {
    /** A human label for the format, e.g. "square" or "story". */
    name: string;
    width: number;
    height: number;
    format: VariantFormat;
}
/**
 * Recommended export sizes per platform. Each platform lists one or more named
 * formats; the first entry is the default/primary feed format.
 */
export declare const PLATFORM_FORMATS: Record<SocialPlatform, PlatformFormat[]>;
/** The primary recommended format for a platform. */
export declare function primaryFormat(platform: SocialPlatform): PlatformFormat;
/**
 * A stable dedup key for a render variant: identical design+page+dimensions+
 * format always produce the same key, so renders are reused across targets.
 */
export declare function variantKey(designId: string, pageId: string, width: number, height: number, format: VariantFormat): string;
/** A per-target request to render the design at a specific spec. */
export interface VariantTarget {
    targetId: string;
    width: number;
    height: number;
    format: VariantFormat;
}
export interface PlannedVariant {
    key: string;
    width: number;
    height: number;
    format: VariantFormat;
    targetIds: string[];
}
/**
 * Collapse targets that share the same (width,height,format) onto a single
 * planned variant (FR-4). Returns one entry per unique spec with all the target
 * ids that map to it, preserving first-seen order of specs.
 */
export declare function planVariants(designId: string, pageId: string, targets: readonly VariantTarget[]): PlannedVariant[];
export interface ResizeProposal {
    platform: SocialPlatform;
    width: number;
    height: number;
    /**
     * "fit" letterboxes the source inside the target (no crop); "fill" crops to
     * cover the target. We propose "fill" when the aspect ratios are close and
     * "fit" when they differ enough that cropping would lose meaningful content.
     */
    mode: "fit" | "fill";
}
/**
 * Propose a resized variant per platform from a source design's dimensions
 * (FR-5). Uses each platform's primary format. The fit/fill mode is a heuristic
 * based on how much the source and target aspect ratios diverge.
 */
export declare function proposeResizes(sourceW: number, sourceH: number, platforms: readonly SocialPlatform[]): ResizeProposal[];
