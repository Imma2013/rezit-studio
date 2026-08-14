"use strict";
// Default styles and small constructors for the rich-text model.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PARAGRAPH_STYLE = exports.DEFAULT_CHAR_STYLE = exports.SOLID_BLACK = exports.BLACK = void 0;
exports.createRun = createRun;
exports.createParagraph = createParagraph;
exports.contentFromText = contentFromText;
exports.BLACK = { srgb: { r: 0, g: 0, b: 0, a: 1 } };
exports.SOLID_BLACK = { type: "solid", color: exports.BLACK };
exports.DEFAULT_CHAR_STYLE = {
    fontFamily: "system",
    fontStyle: "Regular",
    fontSize: 16,
    fill: exports.SOLID_BLACK,
};
exports.DEFAULT_PARAGRAPH_STYLE = {
    align: "left",
    direction: "auto",
};
function createRun(text, style = {}) {
    return { text, style: { ...exports.DEFAULT_CHAR_STYLE, ...style } };
}
function createParagraph(text = "", charStyle = {}, paraStyle = {}) {
    return {
        runs: text ? [createRun(text, charStyle)] : [],
        style: { ...exports.DEFAULT_PARAGRAPH_STYLE, ...paraStyle },
    };
}
/** Content for a new text node from a plain string (one paragraph per line). */
function contentFromText(text, charStyle = {}) {
    return text.split("\n").map((line) => createParagraph(line, charStyle));
}
