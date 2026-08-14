"use strict";
// Folder-tree operations. Pure functions over a flat folder list:
// build the tree, resolve a breadcrumb path, collect descendants, validate a
// move (no cycles), and list the folders/assets a delete would cascade.
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFolderTree = buildFolderTree;
exports.folderPath = folderPath;
exports.descendantIds = descendantIds;
exports.canMoveFolder = canMoveFolder;
exports.folderDeleteCascade = folderDeleteCascade;
/** Build the forest of root folders (parentId null/undefined) with children. */
function buildFolderTree(folders) {
    const nodes = new Map();
    for (const f of folders)
        nodes.set(f.id, { ...f, children: [] });
    const roots = [];
    for (const f of folders) {
        const node = nodes.get(f.id);
        const parent = f.parentId != null ? nodes.get(f.parentId) : undefined;
        if (parent)
            parent.children.push(node);
        else
            roots.push(node);
    }
    // Stable ordering by name within each level.
    const sortRec = (list) => {
        list.sort((a, b) => a.name.localeCompare(b.name));
        list.forEach((n) => sortRec(n.children));
    };
    sortRec(roots);
    return roots;
}
/** Breadcrumb from a root to `folderId` (inclusive), or [] if not found. */
function folderPath(folders, folderId) {
    const byId = new Map(folders.map((f) => [f.id, f]));
    const path = [];
    let cur = byId.get(folderId);
    const seen = new Set();
    while (cur && !seen.has(cur.id)) {
        seen.add(cur.id);
        path.unshift(cur);
        cur = cur.parentId != null ? byId.get(cur.parentId) : undefined;
    }
    return path;
}
/** Ids of `folderId` and all folders nested beneath it. */
function descendantIds(folders, folderId) {
    const childrenOf = new Map();
    for (const f of folders) {
        if (f.parentId != null) {
            const arr = childrenOf.get(f.parentId) ?? [];
            arr.push(f.id);
            childrenOf.set(f.parentId, arr);
        }
    }
    const out = [];
    const stack = [folderId];
    while (stack.length) {
        const id = stack.pop();
        out.push(id);
        for (const c of childrenOf.get(id) ?? [])
            stack.push(c);
    }
    return out;
}
/**
 * Whether moving `folderId` under `targetParentId` is legal: the target must
 * exist (or be null for root), and must not be the folder itself or one of its
 * descendants (which would create a cycle).
 */
function canMoveFolder(folders, folderId, targetParentId) {
    if (targetParentId === null)
        return true;
    if (folderId === targetParentId)
        return false;
    if (!folders.some((f) => f.id === targetParentId))
        return false;
    return !descendantIds(folders, folderId).includes(targetParentId);
}
/** Folders and assets affected by deleting `folderId` (FR-8). */
function folderDeleteCascade(folders, folderId, assets) {
    const folderIds = descendantIds(folders, folderId);
    const set = new Set(folderIds);
    const assetIds = assets.filter((a) => a.folderId != null && set.has(a.folderId)).map((a) => a.id);
    return { folderIds, assetIds };
}
