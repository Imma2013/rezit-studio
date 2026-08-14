"use strict";
// Unicode text segmentation via the platform Intl.Segmenter (available in
// modern browsers and Node 18+). Caret/selection operate on grapheme clusters,
// not code units, and line breaking uses word segments.
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphemes = graphemes;
exports.graphemeCount = graphemeCount;
exports.words = words;
exports.wrapChunks = wrapChunks;
function graphemes(text, locale) {
    const seg = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
}
/** Count of grapheme clusters (the user-perceived character count). */
function graphemeCount(text, locale) {
    return graphemes(text, locale).length;
}
/** Word-like segments (excludes whitespace/punctuation-only segments). */
function words(text, locale) {
    const seg = new Intl.Segmenter(locale, { granularity: "word" });
    const out = [];
    for (const s of seg.segment(text))
        if (s.isWordLike)
            out.push(s.segment);
    return out;
}
/**
 * Split text into chunks at word boundaries for line breaking: each word-like
 * segment and each run of trailing whitespace becomes a chunk, so a line break
 * may occur between any two chunks.
 */
function wrapChunks(text, locale) {
    const seg = new Intl.Segmenter(locale, { granularity: "word" });
    const out = [];
    for (const s of seg.segment(text)) {
        out.push({ text: s.segment, whitespace: /^\s+$/.test(s.segment) });
    }
    return out;
}
