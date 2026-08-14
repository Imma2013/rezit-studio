import type { Membership, WorkspaceRole } from "./types";
/** Higher rank = more authority. */
export declare const ROLE_RANK: Record<WorkspaceRole, number>;
export declare class AuthzError extends Error {
    code: "not-a-member" | "insufficient-role" | "not-active";
    constructor(code: "not-a-member" | "insufficient-role" | "not-active", message: string);
}
/** True when `role` meets or exceeds `min`. */
export declare function roleAtLeast(role: WorkspaceRole, min: WorkspaceRole): boolean;
/** The user's active membership in a workspace, or undefined. */
export declare function membershipOf(memberships: Membership[], userId: string, workspaceId: string): Membership | undefined;
/**
 * Assert the user is an active member of the workspace with at least `minRole`,
 * returning the membership for downstream per-design checks. Throws
 * AuthzError otherwise. `minRole` defaults to viewer (any active member).
 */
export declare function assertMember(memberships: Membership[], userId: string, workspaceId: string, minRole?: WorkspaceRole): Membership;
/** Non-throwing membership/role check. */
export declare function canAccess(memberships: Membership[], userId: string, workspaceId: string, minRole?: WorkspaceRole): boolean;
/** The set of workspace ids a user may access (active memberships only). */
export declare function accessibleWorkspaceIds(memberships: Membership[], userId: string): string[];
/**
 * Filter a list of workspace-scoped rows to those in workspaces the user may
 * access (FR-16). The single choke point used by query helpers so no
 * cross-workspace read can leak.
 */
export declare function scopeToMemberships<T extends {
    workspaceId: string;
}>(rows: T[], memberships: Membership[], userId: string): T[];
