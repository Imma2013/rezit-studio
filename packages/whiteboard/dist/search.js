"use strict";
// On-board search (F30 FR-2). Pure, deterministic, side-effect free. Extracts
// the searchable text of each board node and finds nodes whose text contains a
// query (case-insensitive substring), walking containers so nodes inside frames
// and groups are found too. The frontend builds the find-and-jump UI on top.
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeSearchText = nodeSearchText;
exports.searchNodes = searchNodes;
/* eslint-disable @typescript-eslint/no-explicit-any */
/** The concatenated, human-visible text of a node, or "" if it has none. */
function nodeSearchText(node) {
    const n = node;
    switch (n.type) {
        case "sticky":
            return typeof n.text === "string" ? n.text : "";
        case "connector":
            return typeof n.label?.text === "string" ? n.label.text : "";
        case "frame": {
            const parts = [];
            if (typeof n.name === "string")
                parts.push(n.name);
            if (typeof n.header?.title === "string")
                parts.push(n.header.title);
            return parts.join(" ").trim();
        }
        case "text": {
            // Rich text: concatenate every run across paragraphs.
            const paras = Array.isArray(n.content) ? n.content : [];
            const out = [];
            for (const p of paras) {
                const runs = Array.isArray(p?.runs) ? p.runs : [];
                for (const r of runs)
                    if (typeof r?.text === "string")
                        out.push(r.text);
            }
            return out.join("");
        }
        default:
            return "";
    }
}
function searchKindOf(node) {
    const t = node.type;
    if (t === "sticky" || t === "connector" || t === "frame" || t === "text")
        return t;
    return null;
}
function childrenOf(node) {
    const n = node;
    if (Array.isArray(n.children))
        return n.children;
    return [];
}
/**
 * Find nodes whose searchable text contains `query` (case-insensitive),
 * in document order, descending into frames/groups. A blank query yields no
 * matches. Each node appears at most once.
 */
function searchNodes(nodes, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return [];
    const out = [];
    const visit = (list) => {
        for (const node of list) {
            const kind = searchKindOf(node);
            if (kind) {
                const text = nodeSearchText(node);
                if (text && text.toLowerCase().includes(q)) {
                    out.push({ nodeId: node.id, kind, text });
                }
            }
            const kids = childrenOf(node);
            if (kids.length)
                visit(kids);
        }
    };
    visit(nodes);
    return out;
}
