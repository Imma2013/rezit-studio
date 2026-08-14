"use strict";
// @hc/docs <-> design conversion (F31).
//
// `blocksToDesign` lays a doc out as a standard DesignFile: blocks split into
// pages at each heading of the chosen level, mapped to scene nodes stacked
// vertically down each page. `designToDoc` is the best-effort reverse. Both are
// pure: no I/O, no randomness beyond schema's id factory.
Object.defineProperty(exports, "__esModule", { value: true });
exports.blocksToDesign = blocksToDesign;
exports.designToDoc = designToDoc;
const schema_1 = require("@hc/schema");
const model_1 = require("./model");
const LEFT_MARGIN = 80;
const TOP_MARGIN = 80;
const BLOCK_GAP = 24;
const HEADING_FONT_SIZE = { 1: 36, 2: 28, 3: 22 };
const BODY_FONT_SIZE = 16;
// A font size at or above this in a design text node reads back as a heading.
const HEADING_THRESHOLD = 20;
function baseCharStyle(fontSize) {
    return {
        fontFamily: "Inter",
        fontStyle: "Regular",
        fontSize,
        fill: { type: "solid", color: { srgb: { r: 0, g: 0, b: 0, a: 1 } } },
    };
}
function richToRuns(rt, fontSize) {
    const style = baseCharStyle(fontSize);
    if (rt.runs.length === 0)
        return [{ text: "", style }];
    return rt.runs.map((r) => ({
        text: r.text,
        style: {
            ...style,
            // Carry minimal styling from doc marks where it maps cleanly.
            decoration: r.marks?.includes("underline") ? ["underline"] : undefined,
        },
    }));
}
function makeParagraph(runs) {
    return { runs, style: { align: "left", direction: "auto" } };
}
/** Build a text scene node from inline rich text at a given size and position. */
function textNode(rt, fontSize, x, y, width) {
    const height = Math.max(fontSize * 1.4, 24);
    const node = (0, schema_1.createNode)("text");
    node.transform = { ...node.transform, x, y };
    node.size = { width, height };
    node.box = {
        mode: "autoHeight",
        width,
        height,
        autoFit: { enabled: false, min: 8, max: 512 },
        verticalAlign: "top",
    };
    node.content = [makeParagraph(richToRuns(rt, fontSize))];
    return node;
}
/** Estimated rendered height of a block, to advance the running y offset. */
function estimateHeight(block) {
    switch (block.type) {
        case "heading":
            return HEADING_FONT_SIZE[block.level] * 1.6;
        case "paragraph":
        case "quote":
        case "callout":
            return Math.max(24, BODY_FONT_SIZE * 1.6);
        case "list":
            return Math.max(24, block.items.length * BODY_FONT_SIZE * 1.6);
        case "image":
            return 240;
        case "table":
            return Math.max(48, block.rows.length * 32);
        case "chartEmbed":
            return 240;
        case "divider":
            return 16;
        case "embed":
            return 200;
        case "code":
            return Math.max(48, (block.code.split("\n").length + 2) * BODY_FONT_SIZE * 1.4);
    }
}
/** Map a single doc block to one or more scene nodes at (x, y). */
function blockToNodes(block, x, y, width) {
    switch (block.type) {
        case "heading":
            return [textNode(block.text, HEADING_FONT_SIZE[block.level], x, y, width)];
        case "paragraph":
        case "quote":
        case "callout":
            return [textNode(block.text, BODY_FONT_SIZE, x, y, width)];
        case "list": {
            const lines = {
                runs: block.items.flatMap((item, i) => {
                    const marker = block.style === "numbered"
                        ? `${i + 1}. `
                        : block.style === "checklist"
                            ? item.checked
                                ? "[x] "
                                : "[ ] "
                            : "- ";
                    const prefix = i === 0 ? marker : `\n${marker}`;
                    return [{ text: prefix }, ...item.text.runs];
                }),
            };
            return [textNode(lines, BODY_FONT_SIZE, x, y, width)];
        }
        case "code":
            return [textNode((0, model_1.plainToRichText)(block.code), BODY_FONT_SIZE, x, y, width)];
        case "image": {
            const node = (0, schema_1.createNode)("image");
            node.transform = { ...node.transform, x, y };
            node.size = { width, height: 200 };
            node.source = { assetId: block.assetId || block.url, naturalWidth: 0, naturalHeight: 0 };
            node.fit = "contain";
            if (block.alt)
                node.alt = block.alt;
            return [node];
        }
        case "table": {
            const cols = block.columns.length || 1;
            const node = (0, schema_1.createNode)("table");
            node.transform = { ...node.transform, x, y };
            const tableHeight = Math.max(48, block.rows.length * 32);
            node.size = { width, height: tableHeight };
            node.rows = block.rows.length;
            node.cols = cols;
            node.colWidths = new Array(cols).fill(width / cols);
            node.rowHeights = new Array(block.rows.length).fill(32);
            node.cells = block.rows.flatMap((row, r) => row.cells.slice(0, cols).map((cell, c) => ({
                row: r,
                col: c,
                rowSpan: 1,
                colSpan: 1,
                content: [
                    {
                        text: (0, model_1.richTextToPlain)(cell),
                        fontId: "Inter",
                        fontSize: BODY_FONT_SIZE,
                        weight: 400,
                    },
                ],
            })));
            return [node];
        }
        case "chartEmbed": {
            const node = (0, schema_1.createNode)("chart");
            node.transform = { ...node.transform, x, y };
            node.size = { width, height: 200 };
            node.data = { ...(node.data ?? {}), chartId: block.chartId };
            return [node];
        }
        case "embed": {
            const node = (0, schema_1.createNode)("embed");
            node.transform = { ...node.transform, x, y };
            node.size = { width, height: 180 };
            node.provider = block.provider ?? "iframe";
            node.src = block.url;
            return [node];
        }
        case "divider": {
            const node = (0, schema_1.createNode)("shape");
            node.transform = { ...node.transform, x, y };
            node.size = { width, height: 2 };
            node.shape = "rect";
            return [node];
        }
    }
}
function emptyPage(name, width, height, init) {
    return {
        id: init(),
        name,
        width,
        height,
        background: { type: "solid", color: { srgb: { r: 1, g: 1, b: 1, a: 1 } } },
        children: [],
    };
}
/**
 * Convert a doc's blocks into a DesignFile. Content splits into a new page at
 * each heading whose level equals `splitLevel` (default 1); blocks within a
 * section stack vertically with a running y offset and a left margin.
 */
function blocksToDesign(blocks, opts) {
    const splitLevel = opts?.splitLevel ?? 1;
    const pageWidth = opts?.pageWidth ?? 1080;
    const pageHeight = opts?.pageHeight ?? 1350;
    const contentWidth = pageWidth - LEFT_MARGIN * 2;
    const design = (0, schema_1.createBlankDesign)({ width: pageWidth, height: pageHeight });
    design.meta = { ...design.meta, kind: "design" };
    // newId is available via createBlankDesign's page; reuse schema's factory by
    // creating a throwaway node id. Simpler: use a counter-free unique generator.
    let counter = 0;
    const pageId = () => `${design.id}-p${counter++}`;
    const pages = [];
    let current = emptyPage("Page 1", pageWidth, pageHeight, pageId);
    let y = TOP_MARGIN;
    let started = false;
    const pushCurrent = () => {
        pages.push(current);
    };
    for (const block of blocks) {
        const isSplit = block.type === "heading" && block.level === splitLevel;
        if (isSplit && started) {
            pushCurrent();
            current = emptyPage(`Page ${pages.length + 1}`, pageWidth, pageHeight, pageId);
            y = TOP_MARGIN;
        }
        started = true;
        const nodes = blockToNodes(block, LEFT_MARGIN, y, contentWidth);
        current.children.push(...nodes);
        y += estimateHeight(block) + BLOCK_GAP;
    }
    pushCurrent();
    design.pages = pages;
    return design;
}
// ---------------------------------------------------------------------------
// design -> doc (best-effort reverse)
// ---------------------------------------------------------------------------
function nodePlainText(node) {
    return node.content.map((p) => p.runs.map((r) => r.text).join("")).join("\n");
}
function nodeMaxFontSize(node) {
    let max = 0;
    for (const p of node.content) {
        for (const r of p.runs) {
            if (r.style.fontSize > max)
                max = r.style.fontSize;
        }
    }
    return max;
}
/** Best-effort reverse: turn a design's scene nodes into doc blocks. */
function designToDoc(design) {
    const blocks = [];
    for (const page of design.pages) {
        for (const node of page.children) {
            switch (node.type) {
                case "text": {
                    const tn = node;
                    const text = (0, model_1.plainToRichText)(nodePlainText(tn));
                    if (nodeMaxFontSize(tn) >= HEADING_THRESHOLD) {
                        const size = nodeMaxFontSize(tn);
                        const level = size >= 32 ? 1 : size >= 26 ? 2 : 3;
                        blocks.push((0, model_1.newHeading)(level, text));
                    }
                    else {
                        blocks.push((0, model_1.newParagraph)(text));
                    }
                    break;
                }
                case "image": {
                    const img = node;
                    blocks.push((0, model_1.newImage)({
                        assetId: img.source.assetId,
                        url: img.source.assetId,
                        alt: img.alt,
                    }));
                    break;
                }
                case "table": {
                    const tn = node;
                    const rows = new Map();
                    for (const cell of tn.cells) {
                        const text = cell.content.map((r) => r.text).join("");
                        const arr = rows.get(cell.row) ?? [];
                        arr[cell.col] = (0, model_1.plainToRichText)(text);
                        rows.set(cell.row, arr);
                    }
                    const columns = new Array(Math.max(1, tn.cols))
                        .fill(null)
                        .map(() => ({ align: "left" }));
                    const rowList = [...rows.keys()]
                        .sort((a, b) => a - b)
                        .map((r) => {
                        const row = (0, model_1.newTableRow)();
                        const cells = rows.get(r) ?? [];
                        row.cells = Array.from({ length: tn.cols }, (_, c) => cells[c] ?? (0, model_1.plainToRichText)(""));
                        return row;
                    });
                    blocks.push((0, model_1.newTable)(columns, rowList, true));
                    break;
                }
                default:
                    // Other node types have no doc-block equivalent; skip.
                    break;
            }
        }
    }
    return blocks;
}
