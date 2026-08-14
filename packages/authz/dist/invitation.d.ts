import type { Invitation } from "./types";
export type InviteCheck = {
    ok: true;
} | {
    ok: false;
    reason: "used" | "expired" | "email-mismatch";
};
export declare function isExpired(inv: Invitation, now: number): boolean;
/** Validate an invitation for acceptance at time `now` by `acceptingEmail`. */
export declare function validateInvitation(inv: Invitation, now: number, acceptingEmail?: string): InviteCheck;
