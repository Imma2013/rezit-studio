"use strict";
// PPTX (PowerPoint) import (doc 28, the hard interop half). Parses a real
// .pptx package (unzip + the compact XML parser) into an editable open-format
// DesignFile: one page per slide (size from sldSz), native text boxes with
// per-run styling, preset-geometry shapes with solid/gradient fills and
// strokes, images (embedded media become self-contained data: URL assets)
// with crop, straight connectors as lines, slide backgrounds, speaker notes,
// z-order, rotation/flips (converted from PowerPoint's center-rotation model
// to the engine's top-left-origin model), and groups flattened through their
// chOff/chExt child coordinate spaces. Unknown geometry degrades to a rect of
// the same bounds so layout always survives; nothing is silently dropped.
//
// Pure and dependency-free: runs in browser, worker, and node alike.
Object.defineProperty(exports, "__esModule", { value: true });
exports.pptxToDesign = pptxToDesign;
const schema_1 = require("@hc/schema");
const unzip_1 = require("./unzip");
const xml_1 = require("./xml");
const PX_PER_EMU = 1 / 9525;
const DEG = 60000;
// --- small helpers -----------------------------------------------------------
const px = (emu) => (emu ? Number(emu) * PX_PER_EMU : 0);
function hexToRgb(hex, alpha = 1) {
    const v = parseInt(hex.slice(0, 6), 16);
    if (!Number.isFinite(v))
        return { r: 0, g: 0, b: 0, a: alpha };
    return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255, a: alpha };
}
/** Resolve one DrawingML color element (srgbClr / schemeClr / sysClr child of
 *  a fill), honoring an <a:alpha> modifier. */
function colorFrom(el, theme) {
    if (!el)
        return null;
    const alphaEl = (0, xml_1.findFirst)(el, "a:alpha");
    const alpha = alphaEl ? Math.max(0, Math.min(1, Number(alphaEl.attrs.val) / 100000)) : 1;
    if (el.tag === "a:srgbClr")
        return hexToRgb(el.attrs.val ?? "000000", alpha);
    if (el.tag === "a:sysClr")
        return hexToRgb(el.attrs.lastClr ?? "000000", alpha);
    if (el.tag === "a:schemeClr") {
        const name = el.attrs.val ?? "";
        // tx/bg aliases map onto the dk/lt scheme slots.
        const slot = { tx1: "dk1", tx2: "dk2", bg1: "lt1", bg2: "lt2" }[name] ?? name;
        const hex = theme.get(slot);
        return hex ? hexToRgb(hex, alpha) : { r: 0, g: 0, b: 0, a: alpha };
    }
    return null;
}
function firstColorChild(el, theme) {
    for (const c of el.children) {
        const got = colorFrom(c, theme);
        if (got)
            return got;
    }
    return null;
}
/** Map a DrawingML fill container (spPr / bgPr) to a schema Fill. */
function fillFrom(container, theme) {
    const solid = (0, xml_1.childOf)(container, "a:solidFill");
    if (solid) {
        const c = firstColorChild(solid, theme);
        return c ? { type: "solid", color: { srgb: c } } : null;
    }
    const grad = (0, xml_1.childOf)(container, "a:gradFill");
    if (grad) {
        const stops = (0, xml_1.findAll)(grad, "a:gs")
            .map((gs) => {
            const c = firstColorChild(gs, theme);
            return c ? { position: Math.max(0, Math.min(1, Number(gs.attrs.pos ?? 0) / 100000)), color: { srgb: c } } : null;
        })
            .filter((s) => !!s)
            .sort((a, b) => a.position - b.position);
        if (stops.length >= 2) {
            const lin = (0, xml_1.findFirst)(grad, "a:lin");
            const angle = lin ? (Number(lin.attrs.ang ?? 0) / DEG + 90) % 360 : 135;
            return { type: "gradient", gradient: "linear", angle, stops };
        }
    }
    if ((0, xml_1.childOf)(container, "a:noFill"))
        return null;
    return undefined; // no explicit fill element
}
function strokeFrom(container, theme) {
    const ln = (0, xml_1.childOf)(container, "a:ln");
    if (!ln)
        return null;
    if ((0, xml_1.childOf)(ln, "a:noFill"))
        return null;
    const width = ln.attrs.w ? px(ln.attrs.w) : 1;
    const solid = (0, xml_1.childOf)(ln, "a:solidFill");
    const c = solid ? firstColorChild(solid, theme) : { r: 0, g: 0, b: 0, a: 1 };
    if (!c || width <= 0)
        return null;
    return { fill: { type: "solid", color: { srgb: c } }, width, align: "center", cap: "round", join: "round" };
}
function xfrmFrom(spPr) {
    const xfrm = spPr ? (0, xml_1.childOf)(spPr, "a:xfrm") : null;
    if (!xfrm)
        return null;
    const off = (0, xml_1.childOf)(xfrm, "a:off");
    const ext = (0, xml_1.childOf)(xfrm, "a:ext");
    if (!off || !ext)
        return null;
    const chOff = (0, xml_1.childOf)(xfrm, "a:chOff");
    const chExt = (0, xml_1.childOf)(xfrm, "a:chExt");
    return {
        x: px(off.attrs.x),
        y: px(off.attrs.y),
        w: Math.max(1, px(ext.attrs.cx)),
        h: Math.max(1, px(ext.attrs.cy)),
        rot: Number(xfrm.attrs.rot ?? 0) / DEG,
        flipH: xfrm.attrs.flipH === "1",
        flipV: xfrm.attrs.flipV === "1",
        ...(chOff ? { chOff: { x: px(chOff.attrs.x), y: px(chOff.attrs.y) } } : {}),
        ...(chExt ? { chExt: { w: Math.max(1e-6, px(chExt.attrs.cx)), h: Math.max(1e-6, px(chExt.attrs.cy)) } } : {}),
    };
}
/** PowerPoint rotates about the box CENTER with an unrotated offset; the
 *  engine rotates clockwise about the box's top-left origin. Convert. */
function toEngineTransform(f) {
    let x = f.x;
    let y = f.y;
    if (f.rot) {
        const rad = (f.rot * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const cx = f.x + f.w / 2;
        const cy = f.y + f.h / 2;
        // origin = center - R(rot) . (w/2, h/2)  (clockwise, y-down)
        x = cx - (cos * (f.w / 2) - sin * (f.h / 2));
        y = cy - (sin * (f.w / 2) + cos * (f.h / 2));
    }
    return {
        x,
        y,
        scaleX: f.flipH ? -1 : 1,
        scaleY: f.flipV ? -1 : 1,
        rotation: f.rot,
        // A flip renders leftward/upward from the origin in the engine; shift so
        // the box stays where PowerPoint put it.
        ...(f.flipH ? { x: x + f.w } : {}),
        ...(f.flipV ? { y: y + f.h } : {}),
    };
}
// preset geometry -> schema shape
function shapeFor(prst) {
    switch (prst) {
        case "rect": return { shape: "rect" };
        case "roundRect": return { shape: "rect", rounded: true };
        case "ellipse": return { shape: "ellipse" };
        case "triangle": return { shape: "triangle" };
        case "star5":
        case "star4":
        case "star6":
        case "star8": return { shape: "star" };
        case "diamond": return { shape: "polygon", sides: 4 };
        case "pentagon": return { shape: "polygon", sides: 5 };
        case "hexagon": return { shape: "polygon", sides: 6 };
        case "heptagon": return { shape: "polygon", sides: 7 };
        case "octagon": return { shape: "polygon", sides: 8 };
        case "decagon": return { shape: "polygon", sides: 10 };
        case "dodecagon": return { shape: "polygon", sides: 12 };
        default: return { shape: "rect" }; // bounds-preserving fallback
    }
}
// --- text --------------------------------------------------------------------
function paragraphsFrom(txBody, theme) {
    const paras = [];
    for (const p of (0, xml_1.childrenOf)(txBody, "a:p")) {
        const pPr = (0, xml_1.childOf)(p, "a:pPr");
        const align = { l: "left", ctr: "center", r: "right", just: "justify" }[pPr?.attrs.algn ?? "l"] ?? "left";
        const runs = [];
        for (const r of (0, xml_1.childrenOf)(p, "a:r")) {
            const t = (0, xml_1.childOf)(r, "a:t")?.text ?? "";
            if (!t)
                continue;
            const rPr = (0, xml_1.childOf)(r, "a:rPr");
            const sizePt = rPr?.attrs.sz ? Number(rPr.attrs.sz) / 100 : 18;
            const bold = rPr?.attrs.b === "1";
            const italic = rPr?.attrs.i === "1";
            const under = !!rPr?.attrs.u && rPr.attrs.u !== "none";
            const strike = !!rPr?.attrs.strike && rPr.attrs.strike !== "noStrike";
            const solid = rPr ? (0, xml_1.childOf)(rPr, "a:solidFill") : null;
            const color = solid ? firstColorChild(solid, theme) : null;
            const latin = rPr ? (0, xml_1.childOf)(rPr, "a:latin")?.attrs.typeface : undefined;
            const decoration = [...(under ? ["underline"] : []), ...(strike ? ["strikethrough"] : [])];
            runs.push({
                text: t,
                style: {
                    fontFamily: latin || "system",
                    fontStyle: bold && italic ? "Bold Italic" : bold ? "Bold" : italic ? "Italic" : "Regular",
                    fontSize: Math.max(6, Math.round((sizePt / 0.75) * 10) / 10), // pt -> px @96dpi
                    fill: { type: "solid", color: { srgb: color ?? { r: 0.07, g: 0.09, b: 0.13, a: 1 } } },
                    ...(decoration.length ? { decoration } : {}),
                },
            });
        }
        if (runs.length)
            paras.push({ runs, style: { align, direction: "auto" } });
    }
    return paras;
}
/** Cell text as flat `TextRun`s. A table cell is NOT the paragraph/run tree a
 *  text node uses: `TableCell.content` is `TextRun[]` (`fontId`/`fontSize`/
 *  `weight`), so reusing paragraphsFrom here would produce a node the schema
 *  rejects and the renderer draws unstyled. Paragraphs join with a space
 *  because a cell renders as one line. */
function cellRuns(txBody, theme) {
    const runs = [];
    const paras = (0, xml_1.childrenOf)(txBody, "a:p");
    paras.forEach((p, pi) => {
        if (pi > 0 && runs.length)
            runs.push({ text: " ", fontId: "system", fontSize: 14, weight: 400 });
        for (const r of (0, xml_1.childrenOf)(p, "a:r")) {
            const t = (0, xml_1.childOf)(r, "a:t")?.text ?? "";
            if (!t)
                continue;
            const rPr = (0, xml_1.childOf)(r, "a:rPr");
            const sizePt = rPr?.attrs.sz ? Number(rPr.attrs.sz) / 100 : 14;
            const solid = rPr ? (0, xml_1.childOf)(rPr, "a:solidFill") : null;
            const color = solid ? firstColorChild(solid, theme) : null;
            const under = !!rPr?.attrs.u && rPr.attrs.u !== "none";
            const strike = !!rPr?.attrs.strike && rPr.attrs.strike !== "noStrike";
            const decoration = [...(under ? ["underline"] : []), ...(strike ? ["strikethrough"] : [])];
            runs.push({
                text: t,
                fontId: rPr ? (0, xml_1.childOf)(rPr, "a:latin")?.attrs.typeface || "system" : "system",
                fontSize: Math.max(6, Math.round((sizePt / 0.75) * 10) / 10), // pt -> px @96dpi
                weight: rPr?.attrs.b === "1" ? 700 : 400,
                ...(rPr?.attrs.i === "1" ? { italic: true } : {}),
                ...(color ? { color: { srgb: color } } : {}),
                ...(decoration.length ? { decoration } : {}),
            });
        }
    });
    return runs;
}
// --- the importer ------------------------------------------------------------
/** Parse .pptx bytes into an editable DesignFile. Embedded images become
 *  self-contained data: URL assets, so the file opens anywhere. */
async function pptxToDesign(bytes, opts = {}) {
    const zip = await (0, unzip_1.unzip)(bytes);
    const read = (name) => {
        const data = zip.get(name.replace(/^\//, ""));
        return data ? new TextDecoder().decode(data) : null;
    };
    const readRels = (partPath) => {
        const dir = partPath.slice(0, partPath.lastIndexOf("/") + 1);
        const relsPath = `${dir}_rels/${partPath.slice(partPath.lastIndexOf("/") + 1)}.rels`;
        const out = new Map();
        const xml = read(relsPath);
        if (!xml)
            return out;
        for (const rel of (0, xml_1.findAll)((0, xml_1.parseXml)(xml), "Relationship")) {
            const target = rel.attrs.Target ?? "";
            const resolved = target.startsWith("../") ? dir.replace(/[^/]+\/$/, "") + target.slice(3) : target.startsWith("/") ? target.slice(1) : dir + target;
            out.set(rel.attrs.Id ?? "", resolved);
        }
        return out;
    };
    const presXmlSrc = read("ppt/presentation.xml");
    if (!presXmlSrc)
        throw new Error("not a .pptx (missing ppt/presentation.xml)");
    const pres = (0, xml_1.parseXml)(presXmlSrc);
    const presRels = readRels("ppt/presentation.xml");
    // Slide size (EMU -> px). PowerPoint's default 16:9 is 12192000x6858000.
    const sldSz = (0, xml_1.findFirst)(pres, "p:sldSz");
    const pageW = Math.round(px(sldSz?.attrs.cx) || 1280);
    const pageH = Math.round(px(sldSz?.attrs.cy) || 720);
    // Theme color scheme for schemeClr resolution.
    const theme = new Map();
    const themePath = [...presRels.values()].find((t) => t.includes("theme/")) ?? "ppt/theme/theme1.xml";
    const themeSrc = read(themePath);
    if (themeSrc) {
        const scheme = (0, xml_1.findFirst)((0, xml_1.parseXml)(themeSrc), "a:clrScheme");
        for (const slot of scheme?.children ?? []) {
            const name = slot.tag.replace(/^a:/, "");
            const c = (0, xml_1.childOf)(slot, "a:srgbClr")?.attrs.val ?? (0, xml_1.childOf)(slot, "a:sysClr")?.attrs.lastClr;
            if (c)
                theme.set(name, c);
        }
    }
    const slidePaths = (0, xml_1.findAll)(pres, "p:sldId")
        .map((sl) => presRels.get(sl.attrs["r:id"] ?? ""))
        .filter((path) => !!path);
    const file = (0, schema_1.createBlankDesign)({ title: opts.title ?? "Imported presentation", width: pageW, height: pageH });
    file.pages = [];
    const assets = [];
    let assetSeq = 0;
    let nodeSeq = 0;
    const nid = (kind) => `pptx-${kind}-${++nodeSeq}`;
    const bytesToDataUrl = (data, mime) => {
        let bin = "";
        const CHUNK = 0x8000;
        for (let i = 0; i < data.length; i += CHUNK) {
            bin += String.fromCharCode(...data.subarray(i, i + CHUNK));
        }
        // btoa exists in browser and node 16+.
        return `data:${mime};base64,${btoa(bin)}`;
    };
    for (const slidePath of slidePaths) {
        const src = read(slidePath);
        if (!src)
            continue;
        const slide = (0, xml_1.parseXml)(src);
        const rels = readRels(slidePath);
        const children = [];
        // Slide background.
        const bgPr = (0, xml_1.findFirst)(slide, "p:bgPr");
        const bg = bgPr ? fillFrom(bgPr, theme) : undefined;
        const emitShape = (sp, frame, base) => {
            const abs = {
                x: base.dx + frame.x * base.sx,
                y: base.dy + frame.y * base.sy,
                w: frame.w * base.sx,
                h: frame.h * base.sy,
                rot: frame.rot,
                flipH: frame.flipH,
                flipV: frame.flipV,
            };
            const spPr = (0, xml_1.findFirst)(sp, "p:spPr");
            const prst = spPr ? (0, xml_1.findFirst)(spPr, "a:prstGeom")?.attrs.prst ?? "rect" : "rect";
            const fill = spPr ? fillFrom(spPr, theme) : undefined;
            const stroke = spPr ? strokeFrom(spPr, theme) : null;
            const txBody = (0, xml_1.findFirst)(sp, "p:txBody");
            const paras = txBody ? paragraphsFrom(txBody, theme) : [];
            const t = toEngineTransform(abs);
            // A filled/stroked geometry becomes a shape; visible text overlays it as
            // a text node with the same frame (the open format keeps them separate).
            if (fill || stroke) {
                const geom = shapeFor(prst);
                children.push((0, schema_1.createNode)("shape", {
                    id: nid("shape"),
                    shape: geom.shape,
                    ...(geom.sides ? { sides: geom.sides } : {}),
                    ...(geom.rounded ? { cornerRadius: { tl: 12, tr: 12, br: 12, bl: 12 } } : {}),
                    transform: { ...t, scaleX: t.scaleX, scaleY: t.scaleY, rotation: t.rotation },
                    size: { width: abs.w, height: abs.h },
                    fills: fill ? [fill] : [],
                    ...(stroke ? { stroke } : {}),
                }));
            }
            if (paras.length) {
                children.push((0, schema_1.createNode)("text", {
                    id: nid("text"),
                    transform: { x: t.x, y: t.y, scaleX: 1, scaleY: 1, rotation: t.rotation },
                    size: { width: abs.w, height: abs.h },
                    box: { mode: "fixed", width: abs.w, height: abs.h, autoFit: { enabled: false, min: 6, max: 512 }, verticalAlign: "top" },
                    content: paras,
                }));
            }
        };
        const emitPic = (pic, frame, base) => {
            const embed = (0, xml_1.findFirst)(pic, "a:blip")?.attrs["r:embed"];
            const mediaPath = embed ? rels.get(embed) : undefined;
            const media = mediaPath ? zip.get(mediaPath) : undefined;
            if (!media)
                return;
            const ext = mediaPath.slice(mediaPath.lastIndexOf(".") + 1).toLowerCase();
            const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "gif" ? "image/gif" : "image/png";
            const assetId = `pptx-asset-${++assetSeq}`;
            assets.push({ id: assetId, kind: "image", url: bytesToDataUrl(media, mime), mime, checksum: "" });
            const srcRect = (0, xml_1.findFirst)(pic, "a:srcRect");
            const per = (v) => Math.max(0, Math.min(1, Number(v ?? 0) / 100000));
            let crop;
            if (srcRect) {
                const l = per(srcRect.attrs.l);
                const tt = per(srcRect.attrs.t);
                const w = Math.max(0.001, 1 - l - per(srcRect.attrs.r));
                const h = Math.max(0.001, 1 - tt - per(srcRect.attrs.b));
                crop = { x: l, y: tt, width: w, height: h };
            }
            const abs = { x: base.dx + frame.x * base.sx, y: base.dy + frame.y * base.sy, w: frame.w * base.sx, h: frame.h * base.sy, rot: frame.rot, flipH: frame.flipH, flipV: frame.flipV };
            const t = toEngineTransform(abs);
            children.push((0, schema_1.createNode)("image", {
                id: nid("image"),
                transform: t,
                size: { width: abs.w, height: abs.h },
                source: { assetId, naturalWidth: 0, naturalHeight: 0 },
                fit: "cover",
                ...(crop ? { crop } : {}),
            }));
        };
        // A PowerPoint table (a:tbl) as an editable TableNode: column widths and
        // row heights come from the grid, cell text from each cell's txBody.
        const emitTable = (tbl, abs) => {
            const grid = (0, xml_1.findFirst)(tbl, "a:tblGrid");
            const colWidths = grid ? (0, xml_1.childrenOf)(grid, "a:gridCol").map((c) => px(c.attrs.w)) : [];
            const rowEls = (0, xml_1.childrenOf)(tbl, "a:tr");
            if (!rowEls.length || !colWidths.length)
                return false;
            const rowHeights = rowEls.map((r) => px(r.attrs.h) || 32);
            const cells = [];
            rowEls.forEach((tr, row) => {
                (0, xml_1.childrenOf)(tr, "a:tc").forEach((tc, col) => {
                    // Continuation cells of a merge carry no content of their own.
                    if (tc.attrs.hMerge === "1" || tc.attrs.vMerge === "1")
                        return;
                    const txBody = (0, xml_1.findFirst)(tc, "a:txBody");
                    const content = txBody ? cellRuns(txBody, theme) : [];
                    const algn = txBody ? (0, xml_1.findFirst)(txBody, "a:pPr")?.attrs.algn : undefined;
                    const align = { l: "left", ctr: "center", r: "right" }[algn ?? ""];
                    cells.push({
                        row,
                        col,
                        rowSpan: Math.max(1, Number(tc.attrs.rowSpan ?? 1)),
                        colSpan: Math.max(1, Number(tc.attrs.gridSpan ?? 1)),
                        content,
                        ...(align ? { align } : {}),
                    });
                });
            });
            // Scale the grid to the frame the slide actually gives the table.
            const gridW = colWidths.reduce((a, b) => a + b, 0) || abs.w;
            const gridH = rowHeights.reduce((a, b) => a + b, 0) || abs.h;
            const kx = abs.w > 0 && gridW > 0 ? abs.w / gridW : 1;
            const ky = abs.h > 0 && gridH > 0 ? abs.h / gridH : 1;
            children.push((0, schema_1.createNode)("table", {
                id: nid("table"),
                transform: toEngineTransform(abs),
                size: { width: abs.w || gridW, height: abs.h || gridH },
                rows: rowEls.length,
                cols: colWidths.length,
                colWidths: colWidths.map((w) => w * kx),
                rowHeights: rowHeights.map((h) => h * ky),
                cells,
            }));
            return true;
        };
        // Charts, SmartArt and embedded media have no native equivalent yet.
        // Import them as a bounded, labelled text box so the slide keeps its
        // layout and the user can see exactly what needs replacing.
        const emitUnsupportedGraphic = (frameEl, abs) => {
            const uri = (0, xml_1.findFirst)(frameEl, "a:graphicData")?.attrs.uri ?? "";
            const kind = uri.includes("/chart") ? "Chart" : uri.includes("/diagram") ? "SmartArt diagram" : uri.includes("/table") ? "Table" : "Embedded object";
            const name = (0, xml_1.findFirst)(frameEl, "p:cNvPr")?.attrs.name ?? "";
            const label = `[${kind} from PowerPoint${name ? `: ${name}` : ""} - not imported]`;
            const bw = Math.max(24, abs.w);
            const bh = Math.max(18, abs.h);
            children.push((0, schema_1.createNode)("text", {
                id: nid("text"),
                transform: toEngineTransform(abs),
                size: { width: bw, height: bh },
                box: { mode: "fixed", width: bw, height: bh, autoFit: { enabled: false, min: 6, max: 512 }, verticalAlign: "middle" },
                content: [{
                        runs: [{
                                text: label,
                                style: {
                                    fontFamily: "system",
                                    fontStyle: "Regular",
                                    fontSize: 14,
                                    fill: { type: "solid", color: { srgb: { r: 0.45, g: 0.47, b: 0.53, a: 1 } } },
                                },
                            }],
                        style: { align: "center", direction: "auto" },
                    }],
            }));
        };
        const walkTree = (tree, base) => {
            for (const child of tree.children) {
                if (child.tag === "p:sp") {
                    const frame = xfrmFrom((0, xml_1.findFirst)(child, "p:spPr"));
                    if (frame)
                        emitShape(child, frame, base);
                }
                else if (child.tag === "p:pic") {
                    const frame = xfrmFrom((0, xml_1.findFirst)(child, "p:spPr"));
                    if (frame)
                        emitPic(child, frame, base);
                }
                else if (child.tag === "p:cxnSp") {
                    const spPr = (0, xml_1.findFirst)(child, "p:spPr");
                    const frame = xfrmFrom(spPr);
                    const prst = spPr ? (0, xml_1.findFirst)(spPr, "a:prstGeom")?.attrs.prst : undefined;
                    if (frame && prst === "line") {
                        const stroke = (spPr && strokeFrom(spPr, theme)) || { fill: { type: "solid", color: { srgb: { r: 0, g: 0, b: 0, a: 1 } } }, width: 2, align: "center", cap: "round", join: "round" };
                        const w = frame.w * base.sx;
                        const h = frame.h * base.sy;
                        // flipV mirrors the line's direction inside its box.
                        const pts = frame.flipV ? [{ x: 0, y: h }, { x: w, y: 0 }] : [{ x: 0, y: 0 }, { x: w, y: h }];
                        children.push((0, schema_1.createNode)("line", {
                            id: nid("line"),
                            transform: { x: base.dx + frame.x * base.sx, y: base.dy + frame.y * base.sy, scaleX: 1, scaleY: 1, rotation: frame.rot },
                            size: { width: Math.max(1, w), height: Math.max(1, h) },
                            points: pts,
                            stroke,
                        }));
                    }
                    else if (frame) {
                        emitShape(child, frame, base); // non-line connectors keep their bounds
                    }
                }
                else if (child.tag === "p:graphicFrame") {
                    // Tables, charts, SmartArt and embedded media all arrive as a
                    // graphicFrame. A real table imports as an editable TableNode; the
                    // rest have no native equivalent yet, so they land as a labelled
                    // placeholder at the right position rather than disappearing from
                    // the slide with no trace.
                    // A graphicFrame carries p:xfrm directly (not wrapped in spPr), so
                    // read its offset/extent here rather than through xfrmFrom.
                    const gx = (0, xml_1.findFirst)(child, "p:xfrm");
                    const off = gx ? (0, xml_1.childOf)(gx, "a:off") : null;
                    const ext = gx ? (0, xml_1.childOf)(gx, "a:ext") : null;
                    if (!gx || !off || !ext)
                        continue;
                    const frame = {
                        x: px(off.attrs.x),
                        y: px(off.attrs.y),
                        w: Math.max(1, px(ext.attrs.cx)),
                        h: Math.max(1, px(ext.attrs.cy)),
                        rot: Number(gx.attrs.rot ?? 0) / DEG,
                        flipH: false, // PowerPoint does not mirror graphicFrames
                        flipV: false,
                    };
                    const abs = {
                        x: base.dx + frame.x * base.sx,
                        y: base.dy + frame.y * base.sy,
                        w: frame.w * base.sx,
                        h: frame.h * base.sy,
                        rot: frame.rot,
                        flipH: frame.flipH,
                        flipV: frame.flipV,
                    };
                    const tbl = (0, xml_1.findFirst)(child, "a:tbl");
                    if (tbl && emitTable(tbl, abs))
                        continue;
                    emitUnsupportedGraphic(child, abs);
                }
                else if (child.tag === "p:grpSp") {
                    const frame = xfrmFrom((0, xml_1.findFirst)(child, "p:grpSpPr"));
                    if (!frame)
                        continue;
                    // Children live in the chOff/chExt coordinate space; map into the
                    // group's on-slide box. Group rotation/flip is rare; flatten the
                    // translate+scale exactly and carry rotation onto children as-is.
                    const sx = base.sx * (frame.chExt ? frame.w / frame.chExt.w : 1);
                    const sy = base.sy * (frame.chExt ? frame.h / frame.chExt.h : 1);
                    const dx = base.dx + frame.x * base.sx - (frame.chOff?.x ?? 0) * sx;
                    const dy = base.dy + frame.y * base.sy - (frame.chOff?.y ?? 0) * sy;
                    walkTree(child, { dx, dy, sx, sy });
                }
            }
        };
        const tree = (0, xml_1.findFirst)(slide, "p:spTree");
        if (tree)
            walkTree(tree, { dx: 0, dy: 0, sx: 1, sy: 1 });
        // Speaker notes via the slide's notesSlide relationship.
        let notes = "";
        const notesPath = [...rels.values()].find((p) => p.includes("notesSlides/"));
        if (notesPath) {
            const notesSrc = read(notesPath);
            if (notesSrc) {
                const body = (0, xml_1.parseXml)(notesSrc);
                // The body placeholder's paragraphs; skip the slide-number placeholder.
                const texts = [];
                for (const sp of (0, xml_1.findAll)(body, "p:sp")) {
                    const ph = (0, xml_1.findFirst)(sp, "p:ph");
                    if (ph && ph.attrs.type && ph.attrs.type !== "body")
                        continue;
                    const tx = (0, xml_1.findFirst)(sp, "p:txBody");
                    if (!tx)
                        continue;
                    for (const p of (0, xml_1.childrenOf)(tx, "a:p")) {
                        const line = (0, xml_1.findAll)(p, "a:t").map((t) => t.text).join("");
                        if (line.trim())
                            texts.push(line);
                    }
                }
                notes = texts.join("\n");
            }
        }
        file.pages.push({
            id: `pptx-slide-${file.pages.length + 1}`,
            width: pageW,
            height: pageH,
            children: children,
            ...(bg ? { background: bg } : {}),
            ...(notes ? { notes } : {}),
        });
    }
    if (!file.pages.length)
        throw new Error("no slides found in the .pptx");
    file.assets = assets;
    return file;
}
