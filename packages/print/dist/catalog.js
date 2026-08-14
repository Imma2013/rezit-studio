"use strict";
// Print product catalog and vendor registry (F35 FR-1/FR-14). The seed catalog
// is a small, realistic set used in tests and as a default; runtime resolves the
// live catalog per region via the vendor adapters. The `VendorRegistry` mirrors
// the platform-connector / AI-adapter pattern so new vendors/regions
// register without touching the order flow.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockVendor = exports.VendorRegistry = exports.PRINT_CATALOG = void 0;
exports.filterCatalog = filterCatalog;
exports.findProduct = findProduct;
exports.findSize = findSize;
/** A small, realistic seed catalog. Prices are illustrative at-cost figures. */
exports.PRINT_CATALOG = [
    {
        id: "business_card_std",
        category: "business_card",
        name: "Business Cards",
        sizes: [
            { id: "bc_85x55", label: "85 x 55 mm", widthMm: 85, heightMm: 55 },
            { id: "bc_89x51", label: "US 3.5 x 2 in", widthMm: 88.9, heightMm: 50.8 },
        ],
        substrates: [
            { id: "matte_350", label: "350gsm Matte", priceDeltaCents: 0 },
            { id: "gloss_350", label: "350gsm Gloss", priceDeltaCents: 50 },
            { id: "soft_touch_400", label: "400gsm Soft Touch", priceDeltaCents: 200 },
        ],
        finishes: [
            { id: "none", label: "No finish", priceDeltaCents: 0 },
            { id: "spot_uv", label: "Spot UV", priceDeltaCents: 300 },
            { id: "foil_gold", label: "Gold Foil", priceDeltaCents: 500 },
        ],
        sides: 2,
        requiredDpi: 300,
        colorSpace: "CMYK",
        iccProfile: "FOGRA39",
        bleedMm: 3,
        safeZoneMm: 3,
        regions: ["US", "GB", "DE", "IN"],
        productionDays: 3,
        basePriceCents: { bc_85x55: 1500, bc_89x51: 1500 },
    },
    {
        id: "flyer_std",
        category: "flyer",
        name: "Flyers",
        sizes: [
            { id: "a5", label: "A5 (148 x 210 mm)", widthMm: 148, heightMm: 210 },
            { id: "a4", label: "A4 (210 x 297 mm)", widthMm: 210, heightMm: 297 },
        ],
        substrates: [
            { id: "matte_170", label: "170gsm Matte", priceDeltaCents: 0 },
            { id: "gloss_250", label: "250gsm Gloss", priceDeltaCents: 80 },
        ],
        finishes: [{ id: "none", label: "No finish", priceDeltaCents: 0 }],
        sides: 2,
        requiredDpi: 300,
        colorSpace: "CMYK",
        iccProfile: "FOGRA39",
        bleedMm: 3,
        safeZoneMm: 4,
        regions: ["US", "GB", "DE", "IN", "AU"],
        productionDays: 4,
        basePriceCents: { a5: 2500, a4: 3500 },
    },
    {
        id: "poster_std",
        category: "poster",
        name: "Posters",
        sizes: [
            { id: "a2", label: "A2 (420 x 594 mm)", widthMm: 420, heightMm: 594 },
            { id: "a1", label: "A1 (594 x 841 mm)", widthMm: 594, heightMm: 841 },
        ],
        substrates: [
            { id: "matte_200", label: "200gsm Matte", priceDeltaCents: 0 },
            { id: "satin_240", label: "240gsm Satin", priceDeltaCents: 150 },
        ],
        finishes: [
            { id: "none", label: "No finish", priceDeltaCents: 0 },
            { id: "lamination", label: "Lamination", priceDeltaCents: 400 },
        ],
        sides: 1,
        requiredDpi: 150,
        colorSpace: "CMYK",
        iccProfile: "FOGRA39",
        bleedMm: 5,
        safeZoneMm: 5,
        regions: ["US", "GB", "DE"],
        productionDays: 5,
        basePriceCents: { a2: 1200, a1: 2200 },
    },
    {
        id: "sticker_std",
        category: "sticker",
        name: "Stickers",
        sizes: [
            { id: "sq50", label: "50 x 50 mm", widthMm: 50, heightMm: 50 },
            { id: "sq100", label: "100 x 100 mm", widthMm: 100, heightMm: 100 },
        ],
        substrates: [
            { id: "vinyl_white", label: "White Vinyl", priceDeltaCents: 0 },
            { id: "vinyl_clear", label: "Clear Vinyl", priceDeltaCents: 100 },
        ],
        finishes: [
            { id: "matte", label: "Matte", priceDeltaCents: 0 },
            { id: "gloss", label: "Gloss", priceDeltaCents: 0 },
        ],
        sides: 1,
        requiredDpi: 300,
        colorSpace: "CMYK",
        iccProfile: "FOGRA39",
        bleedMm: 2,
        safeZoneMm: 2,
        regions: ["US", "GB", "DE", "IN", "AU", "CA"],
        productionDays: 4,
        basePriceCents: { sq50: 800, sq100: 1200 },
    },
    {
        id: "mug_std",
        category: "mug",
        name: "Mugs",
        sizes: [{ id: "mug11", label: "11 oz", widthMm: 200, heightMm: 90 }],
        substrates: [{ id: "ceramic_white", label: "White Ceramic", priceDeltaCents: 0 }],
        finishes: [{ id: "gloss", label: "Gloss", priceDeltaCents: 0 }],
        sides: 1,
        requiredDpi: 150,
        colorSpace: "RGB",
        bleedMm: 0,
        safeZoneMm: 5,
        regions: ["US", "GB", "DE"],
        productionDays: 6,
        basePriceCents: { mug11: 900 },
    },
    {
        id: "tshirt_std",
        category: "tshirt",
        name: "T-Shirts",
        sizes: [
            { id: "s", label: "S", widthMm: 280, heightMm: 360 },
            { id: "m", label: "M", widthMm: 300, heightMm: 380 },
            { id: "l", label: "L", widthMm: 320, heightMm: 400 },
        ],
        substrates: [
            { id: "cotton_180", label: "180gsm Cotton", priceDeltaCents: 0 },
            { id: "cotton_organic", label: "Organic Cotton", priceDeltaCents: 300 },
        ],
        finishes: [{ id: "dtg", label: "Direct-to-Garment", priceDeltaCents: 0 }],
        sides: 2,
        requiredDpi: 150,
        colorSpace: "RGB",
        bleedMm: 0,
        safeZoneMm: 10,
        regions: ["US", "GB", "DE", "IN"],
        productionDays: 7,
        basePriceCents: { s: 1500, m: 1500, l: 1500 },
    },
];
/** Filter a catalog by category and/or region availability (FR-1/FR-14). */
function filterCatalog(catalog, filter = {}) {
    return catalog.filter((p) => {
        if (filter.category && p.category !== filter.category)
            return false;
        if (filter.region && !p.regions.includes(filter.region))
            return false;
        return true;
    });
}
/** Find a product by id. */
function findProduct(catalog, id) {
    return catalog.find((p) => p.id === id);
}
/** Find a size on a product by id. */
function findSize(product, sizeId) {
    return product.sizes.find((s) => s.id === sizeId);
}
/**
 * Registry of fulfillment vendors. New vendors/regions register here without
 * touching the order flow (FR-14).
 */
class VendorRegistry {
    constructor() {
        this.vendors = new Map();
    }
    register(vendor) {
        this.vendors.set(vendor.id, vendor);
    }
    unregister(vendorId) {
        this.vendors.delete(vendorId);
    }
    get(vendorId) {
        return this.vendors.get(vendorId);
    }
    list() {
        return [...this.vendors.values()];
    }
    /** All vendors serving `region` (and supporting `capability` when given). */
    resolveAll(query) {
        return this.list().filter((v) => {
            if (!v.regions.includes(query.region))
                return false;
            if (query.capability && !v.capabilities.includes(query.capability))
                return false;
            return true;
        });
    }
    /** The first vendor serving `region` (and `capability`), or undefined. */
    resolve(query) {
        return this.resolveAll(query)[0];
    }
}
exports.VendorRegistry = VendorRegistry;
/**
 * A no-network stub vendor for tests and local dev. `quote` returns a trivial,
 * deterministic breakdown; order submission echoes a synthetic vendor order id.
 */
class MockVendor {
    constructor(id = "mock", regions = ["US", "GB", "DE", "IN"], capabilities = ["business_card", "flyer", "poster", "sticker"]) {
        this.id = id;
        this.regions = regions;
        this.capabilities = capabilities;
    }
    async listProducts(region) {
        return filterCatalog(exports.PRINT_CATALOG, { region });
    }
    async quote(items, _region) {
        const baseCents = items.reduce((sum, it) => sum + 1000 * it.quantity, 0);
        return {
            currency: "USD",
            baseCents,
            optionsCents: 0,
            shippingCents: 0,
            taxesCents: 0,
            subsidyCents: 0,
            totalCents: baseCents,
        };
    }
    async submitOrder(order) {
        return { vendorOrderId: `mock-${order.id}` };
    }
    async cancelOrder(_vendorOrderId) {
        // no-op
    }
    parseWebhook(payload) {
        const p = (payload ?? {});
        return {
            vendorOrderId: String(p.vendorOrderId ?? ""),
            status: String(p.status ?? "submitted"),
            shipment: p.shipment,
        };
    }
}
exports.MockVendor = MockVendor;
