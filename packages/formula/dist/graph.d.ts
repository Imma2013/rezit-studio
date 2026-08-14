import { CellValue } from "./functions";
export interface DependencyGraph {
    /** key -> set of keys that depend ON it (i.e. its dependents). */
    dependents: Map<string, Set<string>>;
    /** key -> set of keys it depends on (i.e. its precedents). */
    precedents: Map<string, Set<string>>;
}
/**
 * Extract the cell keys a formula depends on. Ranges are expanded into the
 * full list of contained cell keys. Returns canonical (non-absolute) keys.
 */
export declare function extractRefs(formulaSource: string): string[];
/**
 * Build dependency graph from a map of cellKey -> formula source.
 * Only formula cells (those present in the map) are graph nodes; their
 * precedents may be literal cells not present in the map.
 */
export declare function buildDependencyGraph(cells: Map<string, string>): DependencyGraph;
/**
 * Recompute the values of formula cells affected by changedKeys.
 *
 * - `cells`: cellKey -> formula source for every formula cell.
 * - `changedKeys`: keys whose underlying value/formula just changed.
 * - `getLiteral`: resolver for a cell's literal value (non-formula cells, or
 *   the previously-computed value of formula cells not in the dirty set).
 *
 * Returns a map of cellKey -> recomputed CellValue, covering exactly the
 * formula cells in the affected (transitive-dependent) set. Cells that are
 * part of a dependency cycle are marked `#CIRCULAR!`.
 */
export declare function recompute(cells: Map<string, string>, changedKeys: string[], getLiteral: (col: number, row: number) => CellValue, opts?: {
    now?: number;
}): Map<string, CellValue>;
