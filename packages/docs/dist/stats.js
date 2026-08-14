"use strict";
// Document outline + statistics: pure helpers over the doc block model
// for the TOC sidebar, reading-time estimate, and word/character counts. No I/O.
Object.defineProperty(exports, "__esModule", { value: true });
exports.docOutline = docOutline;
exports.blockText = blockText;
exports.docStats = docStats;
const model_1 = require("./model");
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 80);
}
/** Extract the heading outline (TOC) in document order. */
function docOutline(blocks) {
    const out = [];
    const used = new Map();
    for (const b of blocks) {
        if (b.type !== "heading")
            continue;
        const text = (0, model_1.richTextToPlain)(b.text).trim();
        let slug = slugify(text) || "section";
        // De-duplicate slugs (heading-2, heading-3, ...) for stable anchors.
        const n = used.get(slug) ?? 0;
        used.set(slug, n + 1);
        if (n > 0)
            slug = `${slug}-${n}`;
        out.push({ id: b.id, level: b.level, text, slug });
    }
    return out;
}
/** All plain text contained in a block (paragraphs, list items, table cells,
 *  captions, code), used for counting. */
function blockText(block) {
    switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
        case "callout":
            return (0, model_1.richTextToPlain)(block.text);
        case "list":
            return block.items.map((i) => (0, model_1.richTextToPlain)(i.text)).join(" ");
        case "code":
            return block.code ?? "";
        case "image":
            return block.caption ? (0, model_1.richTextToPlain)(block.caption) : "";
        case "table":
            return block.rows.map((r) => r.cells.map((c) => (0, model_1.richTextToPlain)(c)).join(" ")).join(" ");
        default:
            return "";
    }
}
function countWords(text) {
    const t = text.trim();
    return t === "" ? 0 : t.split(/\s+/).length;
}
/** Aggregate word/character counts and reading time across a document. */
function docStats(blocks, wordsPerMinute = 200) {
    let words = 0;
    let characters = 0;
    let charactersNoSpaces = 0;
    let headings = 0;
    for (const b of blocks) {
        if (b.type === "heading")
            headings++;
        const text = blockText(b);
        words += countWords(text);
        characters += text.length;
        charactersNoSpaces += text.replace(/\s/g, "").length;
    }
    const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / Math.max(1, wordsPerMinute)));
    return { words, characters, charactersNoSpaces, blocks: blocks.length, headings, readingMinutes };
}
