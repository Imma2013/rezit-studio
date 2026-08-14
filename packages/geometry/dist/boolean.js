"use strict";
// Boolean path operations. Curves are flattened to polygons, run
// through a robust polygon clipper, and returned as a polyline VectorPath.
// Refitting results back to beziers is a later enhancement.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanOp = booleanOp;
const polygon_clipping_1 = __importDefault(require("polygon-clipping"));
const flatten_1 = require("./flatten");
// Each subpath becomes its own single-ring polygon, so multiple subpaths are
// treated as disjoint shapes (the common case for boolean operands) rather than
// outer+holes. Reconstructing true holes from boolean results reused as operands
// needs ring-nesting analysis and is deferred.
function pathToMultiPoly(path) {
    return (0, flatten_1.pathToPolylines)(path).map((poly) => [poly.map((p) => [p.x, p.y])]);
}
function multiPolyToPath(mp) {
    const subpaths = [];
    for (const poly of mp) {
        for (const ring of poly) {
            subpaths.push({ closed: true, anchors: ring.map(([x, y]) => ({ x, y, corner: true })) });
        }
    }
    return { subpaths, fillRule: "nonzero" };
}
function booleanOp(op, paths) {
    if (paths.length === 0)
        return { subpaths: [], fillRule: "nonzero" };
    const [first, ...rest] = paths.map(pathToMultiPoly);
    // polygon-clipping types are loose; cast the result to our MultiPoly shape.
    const pc = polygon_clipping_1.default;
    let result;
    switch (op) {
        case "union":
            result = pc.union(first, ...rest);
            break;
        case "intersect":
            result = pc.intersection(first, ...rest);
            break;
        case "subtract":
            result = pc.difference(first, ...rest);
            break;
        case "exclude":
            result = pc.xor(first, ...rest);
            break;
    }
    return multiPolyToPath(result);
}
