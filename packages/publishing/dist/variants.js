"use strict";
// Render-variant dedup and multi-platform sizing (FR-4/FR-5). Pure.
//
// FR-4: render output is cached and reused across targets that share
// dimensions. We collapse same-(width,height,format) targets onto a single
// variant keyed stably so the export engine renders each unique spec once.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_FORMATS = void 0;
exports.primaryFormat = primaryFormat;
exports.variantKey = variantKey;
exports.planVariants = planVariants;
exports.proposeResizes = proposeResizes;
/**
 * Recommended export sizes per platform. Each platform lists one or more named
 * formats; the first entry is the default/primary feed format.
 */
exports.PLATFORM_FORMATS = {
    instagram: [
        { name: "square", width: 1080, height: 1080, format: "png" },
        { name: "portrait", width: 1080, height: 1350, format: "png" },
        { name: "story", width: 1080, height: 1920, format: "png" },
    ],
    facebook: [{ name: "feed", width: 1200, height: 630, format: "png" }],
    x: [{ name: "landscape", width: 1600, height: 900, format: "png" }],
    linkedin: [{ name: "feed", width: 1200, height: 627, format: "png" }],
    tiktok: [{ name: "vertical", width: 1080, height: 1920, format: "mp4" }],
    pinterest: [{ name: "pin", width: 1000, height: 1500, format: "png" }],
    youtube: [{ name: "thumbnail", width: 1280, height: 720, format: "png" }],
};
/** The primary recommended format for a platform. */
function primaryFormat(platform) {
    return exports.PLATFORM_FORMATS[platform][0];
}
/**
 * A stable dedup key for a render variant: identical design+page+dimensions+
 * format always produce the same key, so renders are reused across targets.
 */
function variantKey(designId, pageId, width, height, format) {
    return `${designId}:${pageId}:${width}x${height}:${format}`;
}
/**
 * Collapse targets that share the same (width,height,format) onto a single
 * planned variant (FR-4). Returns one entry per unique spec with all the target
 * ids that map to it, preserving first-seen order of specs.
 */
function planVariants(designId, pageId, targets) {
    const byKey = new Map();
    const order = [];
    for (const t of targets) {
        const key = variantKey(designId, pageId, t.width, t.height, t.format);
        let entry = byKey.get(key);
        if (!entry) {
            entry = { key, width: t.width, height: t.height, format: t.format, targetIds: [] };
            byKey.set(key, entry);
            order.push(key);
        }
        entry.targetIds.push(t.targetId);
    }
    return order.map((k) => byKey.get(k));
}
/**
 * Propose a resized variant per platform from a source design's dimensions
 * (FR-5). Uses each platform's primary format. The fit/fill mode is a heuristic
 * based on how much the source and target aspect ratios diverge.
 */
function proposeResizes(sourceW, sourceH, platforms) {
    const sourceAspect = sourceW / sourceH;
    return platforms.map((platform) => {
        const fmt = primaryFormat(platform);
        const targetAspect = fmt.width / fmt.height;
        // Relative aspect difference; > 25% divergence => fit (avoid heavy crop).
        const diff = Math.abs(sourceAspect - targetAspect) / targetAspect;
        return {
            platform,
            width: fmt.width,
            height: fmt.height,
            mode: diff > 0.25 ? "fit" : "fill",
        };
    });
}
