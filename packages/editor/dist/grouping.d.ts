import type { DesignFile } from "@hc/schema";
import { type EditCommand } from "./commands";
/** Group selected nodes; returns the new group id and the command performed. */
export declare function group(file: DesignFile, ids: string[], groupId?: string): {
    groupId: string;
    command: EditCommand;
} | null;
/** Ungroup a group; returns the freed child ids and the command performed. */
export declare function ungroup(file: DesignFile, groupId: string): {
    members: string[];
    command: EditCommand;
} | null;
