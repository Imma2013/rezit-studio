import type { WorkspaceRole } from "./types";
/** The three sharing access levels. */
export type AccessMode = "view" | "comment" | "edit";
/** A capability is the unit checked at every gate (FR-8); roles and grants
 *  resolve to a capability set so adding one never touches call sites. */
export type Capability = "view" | "comment" | "edit" | "share" | "approve" | "manage-roles" | "manage-brand" | "delete";
/** Higher rank = more access. Used to take the highest of competing sources. */
export declare const MODE_RANK: Record<AccessMode, number>;
/** Built-in workspace roles mapped to their full capability set (FR-8). Owner
 *  and admin can manage roles and delete; members edit and share; viewers only
 *  view and comment. These seed every workspace and are immutable. */
export declare const BUILTIN_ROLE_CAPABILITIES: Record<WorkspaceRole, Capability[]>;
/** The base AccessMode a workspace role confers on a design before grants/links
 *  (FR-7). A viewer's floor is view; members and up can edit. */
export declare const ROLE_BASE_MODE: Record<WorkspaceRole, AccessMode>;
/** A named, editable capability set assignable at workspace or design scope
 *  (FR-8). Built-in roles are modeled by BUILTIN_ROLE_CAPABILITIES; this is the
 *  custom-role shape the backend stores and passes in. */
export interface CustomRole {
    id: string;
    name: string;
    capabilities: Capability[];
}
/** How an approval lock caps access (FR-11). Default policy keeps everyone able
 *  to comment (review continues) but blocks edits; "view" is stricter. */
export type LockPolicy = "comment" | "view";
/** The result of resolving a caller's access to one design. */
export interface DesignAccess {
    mode: AccessMode;
    capabilities: Capability[];
}
/** Inputs to resolveDesignAccess. Any source may be absent (e.g. an anonymous
 *  link visitor has no workspaceRole and no grants). */
export interface ResolveDesignAccessInput {
    /** The caller's workspace role for the design's workspace, if a member. */
    workspaceRole?: WorkspaceRole;
    /** Explicit per-design grant modes for this caller (by user id and/or email,
     *  already filtered to this design by the backend). */
    grants?: AccessMode[];
    /** The mode of a share link the caller entered through (validated already:
     *  not disabled, not expired, password ok), if any. */
    link?: AccessMode;
    /** Extra capabilities from custom roles assigned to the caller (workspace or
     *  design scope), unioned onto the resolved set. */
    customRoles?: CustomRole[];
    /** True when an approval has locked the design (FR-11); caps the mode. */
    approvalLocked?: boolean;
    /** How the lock caps access when locked. Defaults to "comment". */
    lockPolicy?: LockPolicy;
}
/**
 * Resolve a caller's effective per-design access (FR-7). Takes the highest of
 * the workspace-role mode, every explicit grant, and any link mode, then caps
 * it by the approval-lock policy. Returns the resolved mode plus the union of
 * capabilities from the mode, the workspace role, and any custom roles.
 *
 * When NO source grants access (no role, no grant, no link), the caller has no
 * access: capabilities is empty (mode is reported as "view" only as a default
 * label). Callers must gate on `hasCapability(access, "view")`, not on the mode
 * field, to decide whether access exists at all.
 */
export declare function resolveDesignAccess(input: ResolveDesignAccessInput): DesignAccess;
/** True when the resolved access includes a capability. The single gate the
 *  backend capability checks call (FR-8). */
export declare function hasCapability(access: DesignAccess, cap: Capability): boolean;
/** Whether a mode permits applying document updates over the realtime gateway
 *  (FR-9): only `edit`. Comment/view connect as viewers. */
export declare function modeCanEdit(mode: AccessMode): boolean;
/** True when `role` is one of the four built-in workspace roles. */
export declare function isBuiltinRole(name: string): name is WorkspaceRole;
