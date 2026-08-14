export interface CellRef {
    col: number;
    row: number;
    colAbsolute?: boolean;
    rowAbsolute?: boolean;
}
export interface RangeRef {
    start: CellRef;
    end: CellRef;
}
/** "A" -> 0, "Z" -> 25, "AA" -> 26, "AB" -> 27. Case-insensitive. */
export declare function colToIndex(col: string): number;
/** 0 -> "A", 25 -> "Z", 26 -> "AA", 27 -> "AB". */
export declare function indexToCol(index: number): string;
/** Parse "B3" -> {col:1,row:2}. Supports absolute "$A$1". */
export declare function parseRef(ref: string): CellRef;
/** Parse "A1:B3" -> {start,end}. Normalizes so start is top-left. */
export declare function parseRange(range: string): RangeRef;
/** (1,0) -> "B1". Produces a canonical (non-absolute) cell key. */
export declare function cellKey(col: number, row: number): string;
/** Expand a range into the flat list of cell keys, row-major. */
export declare function rangeKeys(range: RangeRef): string[];
/** Is a string a valid A1 cell reference (ignoring absolute markers)? */
export declare function isCellRef(s: string): boolean;
