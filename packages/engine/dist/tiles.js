"use strict";
// Dirty-rectangle tiling (FR-4). The page is divided into a fixed grid of tiles
// in page space (sized so a tile is ~`tileSize` screen px at the current zoom).
// A repaint touches only the tiles intersecting the dirty region, so repaint
// cost scales with what changed, not with total scene size.
Object.defineProperty(exports, "__esModule", { value: true });
exports.tileKey = tileKey;
exports.tileSizePage = tileSizePage;
exports.tilesForRegion = tilesForRegion;
exports.tileCountForRegion = tileCountForRegion;
function tileKey(t) {
    return `${t.col},${t.row}`;
}
/** Page-space side length of one tile at the given zoom. */
function tileSizePage(tileSize, zoom) {
    return tileSize / (zoom > 0 ? zoom : 1);
}
/** The grid tiles a page-space region overlaps. */
function tilesForRegion(region, tileSize, zoom) {
    const ts = tileSizePage(tileSize, zoom);
    if (region.width <= 0 || region.height <= 0)
        return [];
    const c0 = Math.floor(region.x / ts);
    const r0 = Math.floor(region.y / ts);
    // Tiles are half-open [start, end); a region ending exactly on a boundary
    // does not include the next tile.
    const c1 = Math.ceil((region.x + region.width) / ts) - 1;
    const r1 = Math.ceil((region.y + region.height) / ts) - 1;
    const tiles = [];
    for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
            tiles.push({ col: c, row: r });
        }
    }
    return tiles;
}
/** Count of distinct tiles a region overlaps (handy for repaint accounting). */
function tileCountForRegion(region, tileSize, zoom) {
    return tilesForRegion(region, tileSize, zoom).length;
}
