import type { Rect } from "./math";
export interface Tile {
    col: number;
    row: number;
}
export declare function tileKey(t: Tile): string;
/** Page-space side length of one tile at the given zoom. */
export declare function tileSizePage(tileSize: number, zoom: number): number;
/** The grid tiles a page-space region overlaps. */
export declare function tilesForRegion(region: Rect, tileSize: number, zoom: number): Tile[];
/** Count of distinct tiles a region overlaps (handy for repaint accounting). */
export declare function tileCountForRegion(region: Rect, tileSize: number, zoom: number): number;
