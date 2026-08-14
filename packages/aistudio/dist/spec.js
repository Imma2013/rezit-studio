"use strict";
// F39 AI Creative Studio - the structured design spec the model returns, plus a
// robust validator/normalizer and a JSON Schema for it. The spec carries content
// + roles + a layout intent ONLY; concrete geometry is computed by the layout
// engine (layout.ts), so the model never guesses pixel positions. This is the
// quality win over the old fraction-positioned approach.
Object.defineProperty(exports, "__esModule", { value: true });
exports.designSpecJsonSchema = exports.DesignSpecError = exports.BLOCK_ROLES = exports.DESIGN_LAYOUTS = void 0;
exports.normalizeDesignSpec = normalizeDesignSpec;
exports.DESIGN_LAYOUTS = ["centered", "left", "title-top", "split"];
exports.BLOCK_ROLES = ["eyebrow", "heading", "subheading", "body", "accent"];
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const hex = (v) => typeof v === "string" && HEX_RE.test(v.trim()) ? v.trim().toLowerCase() : undefined;
class DesignSpecError extends Error {
}
exports.DesignSpecError = DesignSpecError;
/** Validate + normalize a parsed model value into an AiDesignSpec. Drops unusable
 *  blocks, defaults safe values, and throws DesignSpecError when nothing usable
 *  remains (the caller surfaces a friendly retry message). */
function normalizeDesignSpec(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new DesignSpecError("The AI response wasn't in the expected format.");
    }
    const root = parsed;
    const layout = exports.DESIGN_LAYOUTS.includes(root.layout) ? root.layout : "centered";
    const bgRaw = (root.background && typeof root.background === "object" ? root.background : {});
    const background = {
        kind: bgRaw.kind === "gradient" ? "gradient" : "solid",
        color: hex(bgRaw.color) ?? "#ffffff",
        color2: hex(bgRaw.color2),
        angle: typeof bgRaw.angle === "number" && Number.isFinite(bgRaw.angle) ? bgRaw.angle : 135,
    };
    const rawBlocks = Array.isArray(root.blocks) ? root.blocks : [];
    const blocks = [];
    for (const item of rawBlocks) {
        if (!item || typeof item !== "object")
            continue;
        const b = item;
        const role = exports.BLOCK_ROLES.includes(b.role) ? b.role : "body";
        const text = typeof b.text === "string" ? b.text.trim() : "";
        if (role !== "accent" && !text)
            continue; // text roles need content
        blocks.push({ role, text: role === "accent" ? undefined : text, color: hex(b.color) });
    }
    if (!blocks.some((b) => b.role !== "accent")) {
        throw new DesignSpecError("The AI didn't return any usable text. Try a more specific prompt.");
    }
    const dir = root.dir === "rtl" ? "rtl" : "ltr";
    return { layout, background, blocks, dir };
}
/** JSON Schema for AiDesignSpec - embedded in the generation prompt and ready to
 *  drive provider structured-output / tool-calling once the backend exposes it. */
exports.designSpecJsonSchema = {
    type: "object",
    additionalProperties: false,
    required: ["layout", "background", "blocks"],
    properties: {
        layout: { type: "string", enum: exports.DESIGN_LAYOUTS },
        background: {
            type: "object",
            additionalProperties: false,
            required: ["kind"],
            properties: {
                kind: { type: "string", enum: ["solid", "gradient"] },
                color: { type: "string", description: "hex, e.g. #1a2b3c" },
                color2: { type: "string", description: "hex; gradient end" },
                angle: { type: "number", description: "gradient angle in degrees" },
            },
        },
        blocks: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["role"],
                properties: {
                    role: { type: "string", enum: exports.BLOCK_ROLES },
                    text: { type: "string" },
                    color: { type: "string", description: "hex" },
                },
            },
        },
    },
};
