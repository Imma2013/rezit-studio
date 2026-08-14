"use strict";
// Clipboard, duplicate, and copy-style/paste-style. All of
// these produce a self-contained scene fragment or a set of SceneOps; the OS
// clipboard interop (async Clipboard API, PNG snapshot, MIME mirror) and the
// off-main-thread serialization belong to the browser layer and are deferred.
//
// A copied payload reuses the open file format's `Node` shape, so a
// selection is essentially a mini design and cross-design/cross-tab paste keeps
// full fidelity. Pasted nodes get fresh ids with internal references rewritten.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PASTE_OFFSET = exports.CLIPBOARD_SCHEMA_VERSION = void 0;
exports.collectAssetIds = collectAssetIds;
exports.selectionRoots = selectionRoots;
exports.serializeSelection = serializeSelection;
exports.defaultIdGen = defaultIdGen;
exports.remapIds = remapIds;
exports.pasteOps = pasteOps;
exports.duplicateOps = duplicateOps;
exports.removeSelectionOps = removeSelectionOps;
exports.cut = cut;
exports.captureStyle = captureStyle;
exports.pasteStyleOps = pasteStyleOps;
const schema_1 = require("@hc/schema");
const tree_1 = require("./tree");
exports.CLIPBOARD_SCHEMA_VERSION = 1;
exports.DEFAULT_PASTE_OFFSET = 16; // px, down-right cascade (FR-3)
// Node types that carry node-level fills / strokes. Text fills live per run
// and are intentionally out of node-level copy-style for now.
const FILL_NODES = new Set(["shape", "path", "icon", "sticker", "frame", "grid", "boolean"]);
const STROKE_NODES = new Set(["shape", "path", "line", "frame", "grid", "connector", "boolean"]);
/** Visit a node and every descendant (container children, mask child, boolean operands). */
function visitTree(node, fn) {
    fn(node);
    for (const c of (0, schema_1.childrenOf)(node))
        visitTree(c, fn);
    const rec = node;
    if (node.type === "mask" && rec.child)
        visitTree(rec.child, fn);
    if (node.type === "boolean" && Array.isArray(rec.operands)) {
        for (const op of rec.operands)
            visitTree(op, fn);
    }
}
function deepClone(v) {
    return JSON.parse(JSON.stringify(v));
}
/** Asset ids referenced by a fragment (image sources, pattern/image fills). */
function collectAssetIds(nodes) {
    const ids = new Set();
    const scanFills = (fills) => {
        if (!Array.isArray(fills))
            return;
        for (const f of fills) {
            if (f && (f.type === "pattern" || f.type === "image")) {
                const src = f.source;
                const a = (src?.assetId ?? f.assetId);
                if (a)
                    ids.add(a);
            }
        }
    };
    for (const root of nodes) {
        visitTree(root, (n) => {
            const rec = n;
            if (n.type === "image") {
                const src = rec.source;
                if (src?.assetId)
                    ids.add(src.assetId);
            }
            scanFills(rec.fills);
        });
    }
    return [...ids];
}
/**
 * The selection "roots": ids that are not a descendant of another selected id.
 * Operations like copy/duplicate/delete act on roots so a container and one of
 * its own descendants are not processed twice.
 */
function selectionRoots(file, selection) {
    const selSet = new Set(selection);
    return selection.filter((id) => {
        const loc = (0, tree_1.locate)(file, id);
        if (!loc)
            return false;
        let p = loc.parent;
        while (p) {
            if (selSet.has(p.id))
                return false;
            const pl = (0, tree_1.locate)(file, p.id);
            p = pl ? pl.parent : null;
        }
        return true;
    });
}
/**
 * Serialize the top-level selection into a native clipboard payload (FR-2).
 * Descendants of a selected container are carried within it, not duplicated as
 * top-level entries.
 */
function serializeSelection(file, selection, source) {
    if (selection.length === 0)
        return null;
    const roots = selectionRoots(file, selection);
    const nodes = roots
        .map((id) => (0, tree_1.locate)(file, id))
        .filter((l) => !!l)
        .map((l) => deepClone(l.node));
    if (nodes.length === 0)
        return null;
    const b = (0, tree_1.unionAABB)(file, roots) ?? { x: 0, y: 0, width: 0, height: 0 };
    return {
        format: "hycanvas.clipboard",
        schemaVersion: exports.CLIPBOARD_SCHEMA_VERSION,
        source,
        nodes,
        assetIds: collectAssetIds(nodes),
        bounds: b,
    };
}
let pasteIdCounter = 0;
/** Default fresh-id generator; pass a custom one in tests for determinism. */
function defaultIdGen() {
    return `n-${++pasteIdCounter}`;
}
/**
 * Clone a fragment with fresh ids, rewriting internal references (connector
 * endpoint attachments) so a paste is self-consistent. Returns the new nodes
 * and the old->new id map.
 */
function remapIds(nodes, idGen = defaultIdGen) {
    const cloned = deepClone(nodes);
    const idMap = new Map();
    for (const root of cloned) {
        visitTree(root, (n) => {
            const fresh = idGen();
            idMap.set(n.id, fresh);
            n.id = fresh;
        });
    }
    // Rewrite intra-fragment id references: connector endpoint attachments, and
    // a photo grid's cell -> frame links (stale childIds would make a later
    // grid re-layout treat every cell as missing and rebuild them empty).
    for (const root of cloned) {
        visitTree(root, (n) => {
            if (n.type === "connector") {
                const rec = n;
                for (const key of ["start", "end"]) {
                    const ep = rec[key];
                    const attach = ep?.attach;
                    const old = attach?.nodeId;
                    if (old && idMap.has(old))
                        attach.nodeId = idMap.get(old);
                }
            }
            else if (n.type === "grid") {
                const cells = n.cells;
                for (const c of cells ?? []) {
                    const old = c.childId;
                    if (old && idMap.has(old))
                        c.childId = idMap.get(old);
                }
            }
        });
    }
    return { nodes: cloned, idMap };
}
/** Translate the fragment's top-level nodes by (dx, dy) in place. */
function offsetNodes(nodes, dx, dy) {
    for (const n of nodes) {
        n.transform = { ...n.transform, x: n.transform.x + dx, y: n.transform.y + dy };
    }
}
/**
 * Produce the insert ops for pasting a payload into the first page (FR-3).
 * Fresh ids are assigned; normal paste centers the fragment's bounding box on
 * `at` (the viewport center) with a cascade offset, in-place paste keeps the
 * original coordinates. Always targets page 0 (the editor core is page-0
 * scoped; cross-page paste lands with multi-page support).
 */
function pasteOps(file, payload, opts) {
    const { nodes } = remapIds(payload.nodes, opts.idGen);
    if (opts.mode === "normal") {
        const cascade = (opts.cascadeIndex ?? 0) * exports.DEFAULT_PASTE_OFFSET;
        // Center the fragment's bounding box on `at`, then cascade down-right.
        const center = {
            x: payload.bounds.x + payload.bounds.width / 2,
            y: payload.bounds.y + payload.bounds.height / 2,
        };
        const at = opts.at ?? center;
        const dx = at.x - center.x + cascade;
        const dy = at.y - center.y + cascade;
        offsetNodes(nodes, dx, dy);
    }
    const children = file.pages[0].children;
    const start = children.length;
    const ops = nodes.map((node, i) => ({
        kind: "insert",
        parent: "page",
        index: start + i,
        node,
    }));
    return { ops, nodeIds: nodes.map((n) => n.id), nodes };
}
/**
 * Duplicate the selection roots with a fresh id each, offset by (offset) and
 * appended after their original parent's children (FR-5). The same `offset`
 * passed to a subsequent duplicate implements power-duplicate. Selection is
 * reduced to roots so a container and its own descendant are not cloned twice.
 */
function duplicateOps(file, selection, offset = { x: exports.DEFAULT_PASTE_OFFSET, y: exports.DEFAULT_PASTE_OFFSET }, idGen = defaultIdGen) {
    const ops = [];
    const nodeIds = [];
    // Track how many clones we have appended to each parent so successive clones
    // into the same parent get increasing indices (preserving their order).
    const appended = new Map();
    for (const id of selectionRoots(file, selection)) {
        const loc = (0, tree_1.locate)(file, id);
        if (!loc)
            continue;
        const { nodes } = remapIds([loc.node], idGen);
        const clone = nodes[0];
        offsetNodes([clone], offset.x, offset.y);
        const parent = loc.parent ? loc.parent.id : "page";
        const extra = appended.get(parent) ?? 0;
        ops.push({ kind: "insert", parent, index: loc.siblings.length + extra, node: clone });
        appended.set(parent, extra + 1);
        nodeIds.push(clone.id);
    }
    return { ops, nodeIds };
}
/**
 * Produce remove ops for the selection roots, ordered so undo restores them to
 * their original positions (FR-7). This is the engine behind delete and the
 * removal half of cut. Removes are emitted in descending document index so that
 * their inverse inserts (applied in reverse) re-create ascending indices.
 */
function removeSelectionOps(file, selection) {
    const locs = selectionRoots(file, selection)
        .map((id) => (0, tree_1.locate)(file, id))
        .filter((l) => !!l)
        .sort((a, b) => b.index - a.index);
    return locs.map((loc) => ({
        kind: "remove",
        parent: (loc.parent ? loc.parent.id : "page"),
        index: loc.index,
        node: loc.node,
    }));
}
/** Cut = copy the selection to a payload, then remove it (FR, AC-1 path). */
function cut(file, selection, source) {
    return {
        payload: serializeSelection(file, selection, source),
        ops: removeSelectionOps(file, selection),
    };
}
/** Capture style-only properties from a node (FR-6). */
function captureStyle(file, nodeId) {
    const loc = (0, tree_1.locate)(file, nodeId);
    if (!loc)
        return null;
    const rec = loc.node;
    const clip = {};
    if (Array.isArray(rec.fills))
        clip.fills = deepClone(rec.fills);
    if (rec.stroke)
        clip.stroke = deepClone(rec.stroke);
    if (Array.isArray(rec.effects))
        clip.effects = deepClone(rec.effects);
    clip.opacity = loc.node.opacity;
    clip.blendMode = loc.node.blendMode;
    return clip;
}
/**
 * Apply a captured style to the selection, adapting per node type and reporting
 * what was applied (FR-6, AC-4). Fills/strokes are skipped on node types that
 * do not support them (for example, text fills live per run).
 */
function pasteStyleOps(file, selection, clip) {
    const ops = [];
    const applied = {};
    for (const id of selection) {
        const loc = (0, tree_1.locate)(file, id);
        if (!loc || loc.node.locked)
            continue; // never restyle a locked node
        const type = loc.node.type;
        const rec = loc.node;
        const fields = [];
        if (clip.fills && FILL_NODES.has(type)) {
            ops.push({ kind: "setFills", node: id, before: rec.fills, after: deepClone(clip.fills) });
            fields.push("fill");
        }
        if (clip.stroke && STROKE_NODES.has(type)) {
            ops.push({ kind: "setStroke", node: id, before: rec.stroke, after: deepClone(clip.stroke) });
            fields.push("stroke");
        }
        if (clip.effects) {
            ops.push({ kind: "setEffects", node: id, before: rec.effects, after: deepClone(clip.effects) });
            fields.push("effects");
        }
        if (clip.opacity !== undefined && clip.opacity !== loc.node.opacity) {
            ops.push({ kind: "setOpacity", node: id, before: loc.node.opacity, after: clip.opacity });
            fields.push("opacity");
        }
        if (clip.blendMode !== undefined && clip.blendMode !== loc.node.blendMode) {
            ops.push({ kind: "setBlend", node: id, before: loc.node.blendMode, after: clip.blendMode });
            fields.push("blendMode");
        }
        if (fields.length)
            applied[id] = fields;
    }
    return { ops, applied };
}
