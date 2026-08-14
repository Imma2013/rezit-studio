import type { CellValue } from "@hc/formula";
export interface CellFont {
    family?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
    color?: string;
}
export interface CellBorder {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    color?: string;
}
export interface CellFormat {
    numberFormat?: string;
    font?: CellFont;
    fill?: string;
    border?: CellBorder;
    align?: {
        h?: "left" | "center" | "right";
        v?: "top" | "middle" | "bottom";
    };
}
export interface Cell {
    v?: number | string | boolean;
    f?: string;
    t?: "number" | "string" | "bool" | "date";
    fmt?: CellFormat;
}
export interface Grid {
    id: string;
    name: string;
    rows: number;
    cols: number;
    cells: Record<string, Cell>;
}
export interface ConditionalRule {
    id: string;
    range: string;
    when: {
        op: "gt" | "lt" | "eq" | "between" | "contains";
        value: unknown;
        value2?: unknown;
    };
    style: CellFormat;
}
export interface DataTable {
    id: string;
    range: string;
    headerRow: boolean;
    columns: {
        name: string;
        type: "number" | "string" | "date" | "bool";
    }[];
    sort?: {
        col: number;
        dir: "asc" | "desc";
    };
    filters?: {
        col: number;
        op: string;
        value: unknown;
    }[];
}
export interface ChartBinding {
    id: string;
    chartId: string;
    gridId: string;
    range: string;
    orientation: "rows" | "columns";
}
export interface SheetMeta {
    kind: "sheet";
    grids: Grid[];
    conditional?: ConditionalRule[];
    tables?: DataTable[];
    bindings?: ChartBinding[];
}
/** Read a cell by A1 key. Returns undefined when the cell is empty. */
export declare function getCell(grid: Grid, key: string): Cell | undefined;
/**
 * Immutable cell update: returns a new Grid with the cell at `key` set.
 * Passing `undefined` clears the cell.
 */
export declare function setCell(grid: Grid, key: string, cell: Cell | undefined): Grid;
/**
 * The value a cell should display: a computed formula result when available,
 * otherwise the cell's literal value. Errors render as their code string.
 */
export declare function cellDisplayValue(cell: Cell | undefined, computed?: CellValue): CellValue;
/** Create an empty grid. */
export declare function createGrid(id: string, name: string, rows?: number, cols?: number): Grid;
