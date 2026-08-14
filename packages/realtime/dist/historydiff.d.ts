import { type DesignFile } from "@hc/schema";
/**
 * A concise label for what changed between two folded design states. Returns ""
 * when no node- or page-level change is detected (the caller then falls back to
 * the author + edit-count label). A single kind of change gets a specific verb
 * ("Moved 2 elements"); a mix gets a neutral "Edited N elements".
 */
export declare function diffLabel(before: DesignFile, after: DesignFile): string;
