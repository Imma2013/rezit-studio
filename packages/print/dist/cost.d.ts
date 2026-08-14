import type { CostBreakdown, PrintProduct } from "./types";
export interface QuoteOptions {
    shippingCents?: number;
    taxRate?: number;
    subsidyCents?: number;
    currency?: string;
}
/**
 * Quantity-tier multiplier applied to the per-unit base price. Higher volumes
 * print cheaper per unit, so the multiplier shrinks at the 10/50/100 tiers.
 * Returns 1 for quantities below the first tier.
 */
export declare function quantityTierMultiplier(qty: number): number;
/**
 * Build a transparent cost breakdown for one configured line.
 *
 * - `baseCents`  = unit base * quantity * quantityTierMultiplier(quantity), rounded.
 * - `optionsCents` = (substrate delta + finish delta) * quantity.
 * - `taxesCents` = round(taxRate * (base + options)).
 * - `subsidyCents` = the platform subsidy (recorded positive; deducted from total).
 * - `totalCents` = base + options + shipping + taxes - subsidy (never below 0).
 */
export declare function quote(product: PrintProduct, sizeId: string, substrateId: string, finishId: string | undefined, quantity: number, opts?: QuoteOptions): CostBreakdown;
