import type { CostBreakdown, PrintOrderItem, PrintOrderStatus } from "./types";
import type { PrintOrder } from "./types";
export type OrderEvent = "submit" | "produce" | "ship" | "deliver" | "cancel" | "problem";
export declare class OrderTransitionError extends Error {
    readonly status: PrintOrderStatus;
    readonly event: OrderEvent;
    constructor(status: PrintOrderStatus, event: OrderEvent);
}
/**
 * Apply an order event to the current status, returning the next status. Throws
 * `OrderTransitionError` for an illegal transition.
 */
export declare function orderTransition(status: PrintOrderStatus, event: OrderEvent): PrintOrderStatus;
/** Whether an event is legal from the given status (no throw). */
export declare function canTransition(status: PrintOrderStatus, event: OrderEvent): boolean;
/**
 * Cancellation is allowed only pre-production: a draft or submitted order (or one
 * stuck in `problem`) can be canceled; once in production or later it cannot
 * (FR-12).
 */
export declare function canCancel(status: PrintOrderStatus): boolean;
/**
 * Clone a prior order's items for a re-order (FR-12). New item ids are minted via
 * `idFor` (default appends "-reorder" plus an index); the generated print-file
 * key is cleared so checkout regenerates it against the current design, and any
 * tracking state on the shipment is reset to a fresh address-only shipment.
 */
export declare function reorderItems(order: Pick<PrintOrder, "items">, idFor?: (item: PrintOrderItem, index: number) => string): PrintOrderItem[];
/** A group of items sharing one destination address. */
export interface AddressGroup {
    /** A stable key derived from the address fields. */
    key: string;
    items: PrintOrderItem[];
}
/**
 * Split items into independent shipment groups by destination address (FR-13).
 * Order of groups follows first appearance; items within a group preserve order.
 */
export declare function splitByAddress(items: PrintOrderItem[]): AddressGroup[];
/**
 * Sum the per-line `cost` breakdowns into one order-level `CostBreakdown`
 * (FR-13). Lines without a `cost` contribute zero. The currency is taken from
 * the first line that declares one (defaults to "USD"); mixed currencies throw.
 */
export declare function orderTotal(items: PrintOrderItem[]): CostBreakdown;
