"use strict";
// Rich-text document operations over the paragraph/run model: plain-
// text extraction (for AI/accessibility/find), find & replace across paragraphs
// (replacement inherits the format at the match start, the documented boundary
// rule, FR-14), and per-range character formatting that splits/coalesces runs.
//
// Find/replace indexes by UTF-16 code unit so positions align with RegExp;
// grapheme-accurate editing is layered on top via segment.ts where needed.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlainText = getPlainText;
exports.getParagraphText = getParagraphText;
exports.findMatches = findMatches;
exports.replaceAll = replaceAll;
exports.applyCharToRange = applyCharToRange;
/** Plain text of a node: runs concatenated, paragraphs joined by newlines. */
function getPlainText(node) {
    return node.content.map((p) => p.runs.map((r) => r.text).join("")).join("\n");
}
function getParagraphText(p) {
    return p.runs.map((r) => r.text).join("");
}
// Per-character (UTF-16 unit) style array for a paragraph.
function explode(p) {
    const chars = [];
    const styles = [];
    for (const run of p.runs) {
        for (const ch of run.text.split("")) {
            chars.push(ch);
            styles.push(run.style);
        }
    }
    return { chars, styles };
}
// Coalesce consecutive equal-style characters back into runs.
function rebuild(chars, styles) {
    const runs = [];
    let i = 0;
    while (i < chars.length) {
        const style = styles[i];
        const key = JSON.stringify(style);
        let text = chars[i];
        let j = i + 1;
        while (j < chars.length && JSON.stringify(styles[j]) === key) {
            text += chars[j];
            j++;
        }
        runs.push({ text, style });
        i = j;
    }
    return runs;
}
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildRegExp(q) {
    let src = q.regex ? q.text : escapeRegExp(q.text);
    if (q.wholeWord)
        src = `\\b(?:${src})\\b`;
    return new RegExp(src, q.caseSensitive ? "g" : "gi");
}
/** All matches across the node's paragraphs (matches do not cross paragraphs). */
function findMatches(node, q) {
    if (q.text === "")
        return [];
    const out = [];
    node.content.forEach((p, pi) => {
        const text = getParagraphText(p);
        const re = buildRegExp(q);
        let m;
        while ((m = re.exec(text)) !== null) {
            out.push({ paragraph: pi, start: m.index, end: m.index + m[0].length, text: m[0] });
            if (m[0].length === 0)
                re.lastIndex++; // avoid infinite loop on empty match
        }
    });
    return out;
}
/**
 * Replace all matches with `replacement`, mutating the node in place. Replacement
 * text takes the character style at each match start. Returns the match count.
 */
function replaceAll(node, q, replacement) {
    if (q.text === "")
        return 0;
    const all = findMatches(node, q); // scan once, then apply per paragraph
    let count = 0;
    node.content.forEach((p, pi) => {
        const matches = all.filter((m) => m.paragraph === pi);
        if (matches.length === 0)
            return;
        const { chars, styles } = explode(p);
        // Apply right-to-left so earlier indices stay valid.
        for (let k = matches.length - 1; k >= 0; k--) {
            const m = matches[k];
            const startStyle = styles[m.start] ?? styles[m.start - 1] ?? p.runs[0]?.style;
            const repChars = replacement.split("");
            const repStyles = repChars.map(() => startStyle);
            chars.splice(m.start, m.end - m.start, ...repChars);
            styles.splice(m.start, m.end - m.start, ...repStyles);
            count++;
        }
        p.runs = rebuild(chars, styles);
    });
    return count;
}
/** Apply a character-style patch to a [start, end) range of a paragraph. */
function applyCharToRange(node, paragraphIndex, start, end, patch) {
    const p = node.content[paragraphIndex];
    if (!p)
        return;
    const { chars, styles } = explode(p);
    for (let i = Math.max(0, start); i < Math.min(end, chars.length); i++) {
        styles[i] = { ...styles[i], ...patch };
    }
    p.runs = rebuild(chars, styles);
}
