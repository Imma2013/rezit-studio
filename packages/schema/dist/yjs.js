"use strict";
// Yjs bridge (Section 6.6). At edit time the design is a Yjs document;
// a database snapshot is a deterministic projection of that CRDT state. The
// mapping is generic and bidirectional: objects become Y.Map, arrays become
// Y.Array, primitives are stored as-is. This yields exactly the structure the
// spec describes (pages and children as Y.Arrays, scalar props as Y.Map entries)
// and is lossless, including UnknownNode.raw and `data` extension slots (AC-2).
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESIGN_ROOT_KEY = void 0;
exports.toY = toY;
exports.fromY = fromY;
exports.fromDesignFile = fromDesignFile;
exports.toDesignFile = toDesignFile;
const Y = __importStar(require("yjs"));
/** Root Y.Map key holding the serialized design inside a Y.Doc. */
exports.DESIGN_ROOT_KEY = "design";
/**
 * Convert a plain JSON value into the equivalent Yjs shared type: objects become
 * Y.Map, arrays become Y.Array, primitives are returned as-is. Exported so the
 * realtime reconciler (`@hc/realtime`) can materialize new subtrees inside a
 * live Y.Doc using exactly the same mapping the snapshot bridge uses.
 */
function toY(value) {
    if (Array.isArray(value)) {
        const arr = new Y.Array();
        arr.push(value.map(toY));
        return arr;
    }
    if (value !== null && typeof value === "object") {
        const map = new Y.Map();
        for (const [k, v] of Object.entries(value)) {
            if (v !== undefined)
                map.set(k, toY(v));
        }
        return map;
    }
    return value; // string | number | boolean | null
}
/**
 * Project a Yjs shared type back to a plain JSON value (the inverse of
 * {@link toY}). Exported so consumers can read a subtree of a live Y.Doc without
 * round-tripping the whole document.
 */
function fromY(value) {
    if (value instanceof Y.Array) {
        return value.toArray().map(fromY);
    }
    if (value instanceof Y.Map) {
        const obj = {};
        for (const [k, v] of value.entries()) {
            obj[k] = fromY(v);
        }
        return obj;
    }
    return value;
}
/** Build a Yjs document from a `DesignFile` (the inverse of `toDesignFile`). */
function fromDesignFile(file) {
    const doc = new Y.Doc();
    const root = doc.getMap(exports.DESIGN_ROOT_KEY);
    for (const [k, v] of Object.entries(file)) {
        if (v !== undefined)
            root.set(k, toY(v));
    }
    return doc;
}
/** Project a Yjs document back to a plain `DesignFile`. Pure and lossless. */
function toDesignFile(doc) {
    const root = doc.getMap(exports.DESIGN_ROOT_KEY);
    const obj = {};
    for (const [k, v] of root.entries()) {
        obj[k] = fromY(v);
    }
    return obj;
}
