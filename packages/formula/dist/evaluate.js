"use strict";
// Evaluate a formula source against a cell-resolution context.
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
const parser_1 = require("./parser");
const refs_1 = require("./refs");
const functions_1 = require("./functions");
const ERR = (code) => ({ error: code });
/** Parse and evaluate a formula source (with or without leading "="). */
function evaluate(formulaSource, ctx) {
    let ast;
    try {
        ast = (0, parser_1.parse)(formulaSource);
    }
    catch {
        return ERR("#VALUE!");
    }
    const fnCtx = { now: ctx.now ?? Date.now() };
    try {
        const result = evalNode(ast, ctx, fnCtx);
        // a bare range collapses to its top-left cell when used as a scalar result
        if (Array.isArray(result)) {
            const flat = result.flat();
            return flat.length ? flat[0] : null;
        }
        return result;
    }
    catch (e) {
        if ((0, functions_1.isError)(e))
            return e;
        return ERR("#VALUE!");
    }
}
function evalNode(node, ctx, fnCtx) {
    switch (node.kind) {
        case "number":
            return node.value;
        case "string":
            return node.value;
        case "boolean":
            return node.value;
        case "ref": {
            let ref;
            try {
                ref = (0, refs_1.parseRef)(node.ref);
            }
            catch {
                return ERR("#REF!");
            }
            return ctx.getCell(ref.col, ref.row);
        }
        case "range": {
            let range;
            try {
                range = (0, refs_1.parseRange)(node.range);
            }
            catch {
                return ERR("#REF!");
            }
            const matrix = [];
            for (let r = range.start.row; r <= range.end.row; r++) {
                const row = [];
                for (let c = range.start.col; c <= range.end.col; c++) {
                    row.push(ctx.getCell(c, r));
                }
                matrix.push(row);
            }
            return matrix;
        }
        case "unary": {
            const operand = scalarize(evalNode(node.operand, ctx, fnCtx));
            if ((0, functions_1.isError)(operand))
                return operand;
            const n = (0, functions_1.toNumber)(operand);
            if ((0, functions_1.isError)(n))
                return n;
            return node.op === "-" ? -n : n;
        }
        case "binary":
            return evalBinary(node, ctx, fnCtx);
        case "call": {
            const fn = functions_1.FUNCTIONS[node.name];
            if (!fn)
                return ERR("#NAME?");
            const args = node.args.map((a) => evalNode(a, ctx, fnCtx));
            return fn(args, fnCtx);
        }
    }
}
function evalBinary(node, ctx, fnCtx) {
    const left = scalarize(evalNode(node.left, ctx, fnCtx));
    const right = scalarize(evalNode(node.right, ctx, fnCtx));
    if ((0, functions_1.isError)(left))
        return left;
    if ((0, functions_1.isError)(right))
        return right;
    const op = node.op;
    if (op === "&") {
        return (0, functions_1.toText)(left) + (0, functions_1.toText)(right);
    }
    if (op === "=" || op === "<>" || op === "<" || op === "<=" || op === ">" || op === ">=") {
        const cmp = (0, functions_1.compareValues)(left, right);
        if (Number.isNaN(cmp))
            return ERR("#VALUE!");
        switch (op) {
            case "=":
                return cmp === 0;
            case "<>":
                return cmp !== 0;
            case "<":
                return cmp < 0;
            case "<=":
                return cmp <= 0;
            case ">":
                return cmp > 0;
            case ">=":
                return cmp >= 0;
        }
    }
    // arithmetic
    const a = (0, functions_1.toNumber)(left);
    if ((0, functions_1.isError)(a))
        return a;
    const b = (0, functions_1.toNumber)(right);
    if ((0, functions_1.isError)(b))
        return b;
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            if (b === 0)
                return ERR("#DIV/0!");
            return a / b;
        case "^":
            return Math.pow(a, b);
    }
    return ERR("#VALUE!");
}
/** Collapse a matrix arg to a single scalar (top-left), pass scalars through. */
function scalarize(v) {
    if (Array.isArray(v)) {
        const flat = v.flat();
        return flat.length ? flat[0] : null;
    }
    return v;
}
