"use strict";
// @hc/docs block model (F31).
//
// A "doc" is a DesignFile whose `meta.kind === "doc"`. Its content is an ordered
// list of typed content blocks stored in meta (NOT scene-graph nodes). The block
// model is defined here, framework-agnostic, with plain TS interfaces, a
// discriminated union, constructors, and pure text/array helpers.
Object.defineProperty(exports, "__esModule", { value: true });
exports.newId = newId;
exports.richTextToPlain = richTextToPlain;
exports.plainToRichText = plainToRichText;
exports.newParagraph = newParagraph;
exports.newHeading = newHeading;
exports.newList = newList;
exports.newListItem = newListItem;
exports.newQuote = newQuote;
exports.newCode = newCode;
exports.newDivider = newDivider;
exports.newImage = newImage;
exports.newChartEmbed = newChartEmbed;
exports.newTable = newTable;
exports.newTableRow = newTableRow;
exports.newCallout = newCallout;
exports.newEmbed = newEmbed;
exports.convertBlock = convertBlock;
exports.reorderBlocks = reorderBlocks;
const schema_1 = require("@hc/schema");
// ---------------------------------------------------------------------------
// Ids
// ---------------------------------------------------------------------------
/**
 * Fresh block/item id. Reuses @hc/schema's `newId` (UUID v4) so doc ids are
 * consistent with the rest of the open format. The optional `seed` produces a
 * deterministic id, which keeps tests stable when desired.
 */
function newId(seed) {
    if (seed !== undefined)
        return `b_${seed}`;
    return (0, schema_1.newId)();
}
// ---------------------------------------------------------------------------
// RichText helpers
// ---------------------------------------------------------------------------
/** Concatenate all run text into a single plain string. */
function richTextToPlain(rt) {
    return rt.runs.map((r) => r.text).join("");
}
/** Wrap a plain string as a single unstyled run. */
function plainToRichText(s) {
    return { runs: [{ text: s }] };
}
function emptyRich() {
    return { runs: [] };
}
// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------
function newParagraph(text) {
    return {
        id: newId(),
        type: "paragraph",
        text: typeof text === "string" ? plainToRichText(text) : text ?? emptyRich(),
    };
}
function newHeading(level, text) {
    return {
        id: newId(),
        type: "heading",
        level,
        text: typeof text === "string" ? plainToRichText(text) : text ?? emptyRich(),
    };
}
function newList(style = "bullet", items = []) {
    return { id: newId(), type: "list", style, items };
}
function newListItem(text, depth = 0) {
    return {
        id: newId(),
        text: typeof text === "string" ? plainToRichText(text) : text ?? emptyRich(),
        depth,
    };
}
function newQuote(text) {
    return {
        id: newId(),
        type: "quote",
        text: typeof text === "string" ? plainToRichText(text) : text ?? emptyRich(),
    };
}
function newCode(code = "", language) {
    return { id: newId(), type: "code", code, language };
}
function newDivider() {
    return { id: newId(), type: "divider" };
}
function newImage(init) {
    return {
        id: newId(),
        type: "image",
        assetId: init.assetId ?? "",
        url: init.url,
        caption: init.caption,
        alt: init.alt,
    };
}
function newChartEmbed(chartId) {
    return { id: newId(), type: "chartEmbed", chartId };
}
function newTable(columns = [{ align: "left" }], rows = [], headerRow = true) {
    return { id: newId(), type: "table", headerRow, columns, rows };
}
function newTableRow(cells = []) {
    return { id: newId(), cells };
}
function newCallout(tone = "info", text, icon) {
    return {
        id: newId(),
        type: "callout",
        tone,
        icon,
        text: typeof text === "string" ? plainToRichText(text) : text ?? emptyRich(),
    };
}
function newEmbed(url, provider) {
    return { id: newId(), type: "embed", url, provider };
}
// ---------------------------------------------------------------------------
// Conversion between compatible block types
// ---------------------------------------------------------------------------
const TEXT_BLOCK_TYPES = new Set([
    "paragraph",
    "heading",
    "quote",
    "callout",
]);
/** Read the inline text of any text-bearing block as plain text. */
function blockPlainText(block) {
    switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
        case "callout":
            return richTextToPlain(block.text);
        case "list":
            return block.items.map((i) => richTextToPlain(i.text)).join("\n");
        case "code":
            return block.code;
        default:
            return "";
    }
}
/** Read the inline RichText of a single-text block, preserving runs. */
function blockRichText(block) {
    switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
        case "callout":
            return block.text;
        case "list":
            // Flatten items into one run sequence separated by newlines.
            return {
                runs: block.items.flatMap((item, i) => i === 0 ? item.text.runs : [{ text: "\n" }, ...item.text.runs]),
            };
        case "code":
            return plainToRichText(block.code);
        default:
            return emptyRich();
    }
}
/**
 * Convert a block between compatible text block types, preserving text.
 * Supports paragraph <-> heading <-> quote <-> callout and list <-> paragraph
 * (by joining lines into one paragraph, or splitting paragraph lines into list
 * items). The block id is preserved across conversion.
 */
function convertBlock(block, toType) {
    if (block.type === toType)
        return block;
    const id = block.id;
    // Any text-bearing block (incl. list and code) -> code: join its text into the
    // code body, preserving the text. blockPlainText already handles every source.
    if (toType === "code" && (TEXT_BLOCK_TYPES.has(block.type) || block.type === "list" || block.type === "code")) {
        return { id, type: "code", code: blockPlainText(block) };
    }
    // list -> paragraph: join item lines into one paragraph.
    if (block.type === "list" && toType === "paragraph") {
        return { id, type: "paragraph", text: blockRichText(block) };
    }
    // paragraph (or other text block, incl. code) -> list: split text lines into items.
    if (toType === "list" && (TEXT_BLOCK_TYPES.has(block.type) || block.type === "code")) {
        const plain = blockPlainText(block);
        const lines = plain.split("\n");
        const items = lines.map((line) => ({
            id: newId(),
            text: plainToRichText(line),
            depth: 0,
        }));
        return { id, type: "list", style: "bullet", items };
    }
    // Among the single-text block types (and code as a source), move the RichText
    // across, preserving runs. Code carries only plain text, so it maps via
    // blockRichText (which wraps the code body as a single run).
    if ((TEXT_BLOCK_TYPES.has(block.type) || block.type === "code") &&
        TEXT_BLOCK_TYPES.has(toType)) {
        const text = blockRichText(block);
        switch (toType) {
            case "paragraph":
                return { id, type: "paragraph", text };
            case "heading":
                return { id, type: "heading", level: 1, text };
            case "quote":
                return { id, type: "quote", text };
            case "callout":
                return { id, type: "callout", tone: "info", text };
        }
    }
    // list -> heading/quote/callout: join then wrap.
    if (block.type === "list" && TEXT_BLOCK_TYPES.has(toType)) {
        const text = blockRichText(block);
        switch (toType) {
            case "heading":
                return { id, type: "heading", level: 1, text };
            case "quote":
                return { id, type: "quote", text };
            case "callout":
                return { id, type: "callout", tone: "info", text };
            case "paragraph":
                return { id, type: "paragraph", text };
        }
    }
    // Incompatible conversion: return the original block unchanged.
    return block;
}
// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------
/** Pure array move: return a new order with the item at `fromIndex` moved to
 *  `toIndex`. Out-of-range indices are clamped; the input is not mutated. */
function reorderBlocks(order, fromIndex, toIndex) {
    const next = order.slice();
    if (next.length === 0)
        return next;
    const from = Math.max(0, Math.min(fromIndex, next.length - 1));
    const to = Math.max(0, Math.min(toIndex, next.length - 1));
    if (from === to)
        return next;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}
