"use strict";
// Print and mockups data model (F35 Section 6). These interfaces describe the
// print product catalog, mockup templates, pre-flight results, cost breakdowns,
// and the order/shipment records. The pure core in this package operates on a
// `DesignFile` plus a `PrintProduct` and produces print geometry,
// pre-flight results, quotes, mockup placement, and order-state transitions.
// Network, persistence, payment, and rasterization live in the runtime layer.
Object.defineProperty(exports, "__esModule", { value: true });
