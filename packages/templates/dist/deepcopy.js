"use strict";
// Deep-copy a DesignFile with fresh ids. The
// produced design is fully decoupled from the source template: a new design id,
// new page ids, and new node ids (with internal references rewritten). Editing
// or deleting the source never affects a design created from this copy.
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopyDesign = deepCopyDesign;
const schema_1 = require("@hc/schema");
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
let counter = 0;
function defaultIdGen() {
    return `n-${++counter}`;
}
/** Deep-copy a design, regenerating the design id, page ids, and all node ids. */
function deepCopyDesign(file, opts = {}) {
    const idGen = opts.idGen ?? defaultIdGen;
    const clone = JSON.parse(JSON.stringify(file));
    const idMap = new Map();
    clone.id = opts.designId ?? idGen();
    for (const page of clone.pages) {
        const newPageId = idGen();
        idMap.set(page.id, newPageId);
        page.id = newPageId;
        for (const root of page.children) {
            visitTree(root, (n) => {
                const fresh = idGen();
                idMap.set(n.id, fresh);
                n.id = fresh;
            });
        }
    }
    // Rewrite connector endpoint attachments that point within the copied design.
    for (const page of clone.pages) {
        for (const root of page.children) {
            visitTree(root, (n) => {
                if (n.type !== "connector")
                    return;
                const rec = n;
                for (const key of ["start", "end"]) {
                    const ep = rec[key];
                    const attach = ep?.attach;
                    const old = attach?.nodeId;
                    if (old && idMap.has(old))
                        attach.nodeId = idMap.get(old);
                }
            });
        }
    }
    return { file: clone, idMap };
}
