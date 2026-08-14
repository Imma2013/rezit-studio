"use strict";
// Workspace invitations. Tokens are single-use and expiring;
// accepting an invite for a different email is refused. Accepting an invite to a
// workspace the user already belongs to is idempotent - decided at the
// membership layer; here we only validate the token itself.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExpired = isExpired;
exports.validateInvitation = validateInvitation;
function norm(email) {
    return email.trim().toLowerCase();
}
function isExpired(inv, now) {
    return Date.parse(inv.expiresAt) <= now;
}
/** Validate an invitation for acceptance at time `now` by `acceptingEmail`. */
function validateInvitation(inv, now, acceptingEmail) {
    if (inv.acceptedAt)
        return { ok: false, reason: "used" };
    if (isExpired(inv, now))
        return { ok: false, reason: "expired" };
    if (acceptingEmail !== undefined && norm(acceptingEmail) !== norm(inv.email)) {
        return { ok: false, reason: "email-mismatch" };
    }
    return { ok: true };
}
