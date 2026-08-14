import type { CostBreakdown, PrintProduct, PrintSize, ShipmentInfo } from "./types";
import type { PrintOrder } from "./types";
/** A small, realistic seed catalog. Prices are illustrative at-cost figures. */
export declare const PRINT_CATALOG: PrintProduct[];
export interface CatalogFilter {
    category?: string;
    region?: string;
}
/** Filter a catalog by category and/or region availability (FR-1/FR-14). */
export declare function filterCatalog(catalog: PrintProduct[], filter?: CatalogFilter): PrintProduct[];
/** Find a product by id. */
export declare function findProduct(catalog: PrintProduct[], id: string): PrintProduct | undefined;
/** Find a size on a product by id. */
export declare function findSize(product: PrintProduct, sizeId: string): PrintSize | undefined;
export interface QuoteItem {
    productId: string;
    sizeId: string;
    substrateId: string;
    finishId?: string;
    quantity: number;
}
/**
 * A fulfillment vendor adapter. Implementations are pure adapters over a remote
 * vendor API; the registry resolves them by region/capability. The methods are
 * async by contract (the runtime layer makes network calls); the registry and
 * `MockVendor` below are fully testable without any network.
 */
export interface VendorAdapter {
    id: string;
    /** Regions this vendor serves (ISO country codes). */
    regions: string[];
    /** Named capabilities this vendor supports (e.g. category ids, "foil"). */
    capabilities: string[];
    listProducts(region: string): Promise<PrintProduct[]>;
    quote(items: QuoteItem[], region: string): Promise<CostBreakdown>;
    submitOrder(order: PrintOrder): Promise<{
        vendorOrderId: string;
    }>;
    cancelOrder(vendorOrderId: string): Promise<void>;
    parseWebhook(payload: unknown): {
        vendorOrderId: string;
        status: string;
        shipment?: ShipmentInfo;
    };
}
export interface VendorResolveQuery {
    region: string;
    capability?: string;
}
/**
 * Registry of fulfillment vendors. New vendors/regions register here without
 * touching the order flow (FR-14).
 */
export declare class VendorRegistry {
    private readonly vendors;
    register(vendor: VendorAdapter): void;
    unregister(vendorId: string): void;
    get(vendorId: string): VendorAdapter | undefined;
    list(): VendorAdapter[];
    /** All vendors serving `region` (and supporting `capability` when given). */
    resolveAll(query: VendorResolveQuery): VendorAdapter[];
    /** The first vendor serving `region` (and `capability`), or undefined. */
    resolve(query: VendorResolveQuery): VendorAdapter | undefined;
}
/**
 * A no-network stub vendor for tests and local dev. `quote` returns a trivial,
 * deterministic breakdown; order submission echoes a synthetic vendor order id.
 */
export declare class MockVendor implements VendorAdapter {
    readonly id: string;
    readonly regions: string[];
    readonly capabilities: string[];
    constructor(id?: string, regions?: string[], capabilities?: string[]);
    listProducts(region: string): Promise<PrintProduct[]>;
    quote(items: QuoteItem[], _region: string): Promise<CostBreakdown>;
    submitOrder(order: PrintOrder): Promise<{
        vendorOrderId: string;
    }>;
    cancelOrder(_vendorOrderId: string): Promise<void>;
    parseWebhook(payload: unknown): {
        vendorOrderId: string;
        status: string;
        shipment?: ShipmentInfo;
    };
}
