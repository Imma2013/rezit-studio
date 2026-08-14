"use strict";
// Shipping address (F35 FR-9). Personal data, workspace-isolated at the query
// layer; the pure core only models the shape and a structural validity check.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAddress = isValidAddress;
/**
 * Structural address validity (FR-9). Not a postal-database lookup: it checks
 * that the required fields are present and the country looks like an ISO code.
 * Region-specific postal validation is the runtime layer's concern.
 */
function isValidAddress(a) {
    if (!a)
        return false;
    const required = ["name", "line1", "city", "postalCode", "country"];
    for (const f of required) {
        const v = a[f];
        if (typeof v !== "string" || v.trim() === "")
            return false;
    }
    // ISO 3166-1 alpha-2 country code.
    return /^[A-Za-z]{2}$/.test((a.country ?? "").trim());
}
