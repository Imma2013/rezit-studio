export interface Address {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postalCode: string;
    country: string;
    phone?: string;
}
/**
 * Structural address validity (FR-9). Not a postal-database lookup: it checks
 * that the required fields are present and the country looks like an ISO code.
 * Region-specific postal validation is the runtime layer's concern.
 */
export declare function isValidAddress(a: Partial<Address> | undefined | null): a is Address;
