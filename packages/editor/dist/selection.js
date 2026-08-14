"use strict";
// Selection model (FR-1..FR-4). A small ordered set of node ids with the
// toggle/add/clear semantics the canvas and layer panel both drive. Marquee and
// click hit-testing come from the engine; here we filter to selectable nodes.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionModel = void 0;
exports.isSelectable = isSelectable;
exports.selectAll = selectAll;
exports.selectSameType = selectSameType;
exports.marqueeSelect = marqueeSelect;
const schema_1 = require("@hc/schema");
/** A node is selectable by click/marquee when it is neither hidden nor locked. */
function isSelectable(node) {
    return !node.hidden && !node.locked;
}
class SelectionModel {
    constructor() {
        this.ids = [];
    }
    get() {
        return [...this.ids];
    }
    has(id) {
        return this.ids.includes(id);
    }
    set(ids) {
        this.ids = [...new Set(ids)];
    }
    add(ids) {
        for (const id of ids)
            if (!this.ids.includes(id))
                this.ids.push(id);
    }
    remove(ids) {
        const drop = new Set(ids);
        this.ids = this.ids.filter((id) => !drop.has(id));
    }
    /** Toggle membership without clearing the rest (Shift/Cmd-click, FR-2). */
    toggle(id) {
        if (this.ids.includes(id))
            this.remove([id]);
        else
            this.add([id]);
    }
    clear() {
        this.ids = [];
    }
}
exports.SelectionModel = SelectionModel;
/** All selectable top-level nodes on a page (Cmd/Ctrl+A, FR-4). */
function selectAll(file, pageIndex = 0) {
    const page = file.pages[pageIndex];
    return page ? page.children.filter(isSelectable).map((n) => n.id) : [];
}
/** All selectable nodes (any depth) sharing the seed node's type (FR-4). */
function selectSameType(file, seedId, pageIndex = 0) {
    const page = file.pages[pageIndex];
    if (!page)
        return [];
    let seedType = null;
    const all = [];
    const walk = (nodes) => {
        for (const n of nodes) {
            all.push(n);
            if (n.id === seedId)
                seedType = n.type;
            if ((0, schema_1.isContainer)(n))
                walk((0, schema_1.childrenOf)(n));
        }
    };
    walk(page.children);
    if (!seedType)
        return [];
    return all.filter((n) => n.type === seedType && isSelectable(n)).map((n) => n.id);
}
/**
 * Marquee selection: hit-test the rectangle via the engine, then keep only
 * selectable (visible, unlocked) nodes (FR-3).
 */
function marqueeSelect(scene, rect, mode) {
    return scene
        .hitTestRect(rect, mode)
        .filter((n) => isSelectable(n))
        .map((n) => n.id);
}
