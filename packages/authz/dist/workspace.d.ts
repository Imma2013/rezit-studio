import type { Membership, User, Workspace, WorkspaceRole } from "./types";
/** The personal workspace auto-provisioned on first sign-in (FR-2). */
export declare function personalWorkspaceFor(user: User, id: string, now: string): Workspace;
/** Personal workspaces can never be deleted while the account exists. */
export declare function canDeleteWorkspace(ws: Workspace): boolean;
/** A workspace must always keep at least one active owner. */
export declare function canRemoveMember(memberships: Membership[], workspaceId: string, targetUserId: string): boolean;
/** Whether a role change is allowed (never demote the last owner). */
export declare function canChangeRole(memberships: Membership[], workspaceId: string, targetUserId: string, newRole: WorkspaceRole): boolean;
