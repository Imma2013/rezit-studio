import type { BlendMode, DesignFile } from "@hc/schema";
import type { EditCommand } from "./commands";
export declare function setLocked(file: DesignFile, id: string, value: boolean): EditCommand | null;
export declare function setHidden(file: DesignFile, id: string, value: boolean): EditCommand | null;
export declare function setOpacity(file: DesignFile, id: string, value: number): EditCommand | null;
export declare function setBlend(file: DesignFile, id: string, mode: BlendMode): EditCommand | null;
export declare function rename(file: DesignFile, id: string, name: string): EditCommand | null;
/**
 * Isolate (solo): the sibling node ids that should be hidden so only `id` (and
 * its subtree) is visible. Returns [] when `id` is null (isolation cleared).
 * Isolation is a transient editor concern, so this computes the set rather than
 * mutating persisted `hidden` flags (FR-23).
 */
export declare function isolationHiddenSiblings(file: DesignFile, id: string | null): string[];
