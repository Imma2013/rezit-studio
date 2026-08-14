import type { AppScope, MiniApp } from "./types";
export type AppAction = "insert-node" | "edit-own-nodes" | "read-selection" | "network";
export interface ScopeDecision {
    allowed: boolean;
    reason?: string;
}
export declare function hasScope(app: Pick<MiniApp, "scopes">, scope: AppScope): boolean;
/** Decide whether an app may perform an action (FR-8). */
export declare function checkAppAction(app: Pick<MiniApp, "scopes">, action: AppAction): ScopeDecision;
/** Throw when an app attempts an out-of-scope action (host-side guard). */
export declare function assertAppAction(app: Pick<MiniApp, "scopes">, action: AppAction): void;
/**
 * Whether an app may edit a given node: it must hold "edit-own-nodes" and the
 * node must be one the app inserted (tracked by the host via `ownedNodeIds`).
 */
export declare function canEditNode(app: Pick<MiniApp, "scopes">, ownedNodeIds: ReadonlySet<string>, nodeId: string): boolean;
