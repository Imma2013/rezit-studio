"use strict";
// @hc/schema - the open design file format: types and zod schemas.
//
// This is the single source of truth for the format. TypeScript interfaces are
// the public types every other package imports; the zod schemas alongside them
// power runtime validation (see validate.ts) and JSON Schema generation (see
// json-schema.ts), so the static types and the runtime validator cannot drift.
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFlowSchema = exports.TextBoxSchema = exports.ParagraphSchema = exports.ParagraphStyleSchema = exports.RunSchema = exports.CharStyleSchema = exports.TextRunSchema = exports.NodeBaseSchema = exports.KNOWN_NODE_TYPES = exports.ColorSwatchSchema = exports.FontRefSchema = exports.AssetRefSchema = exports.GuideSchema = exports.VectorPathSchema = exports.SubPathSchema = exports.VectorAnchorSchema = exports.ImageMotionSchema = exports.PageTransitionSchema = exports.InteractionSchema = exports.InteractionActionSchema = exports.NodeAnimationSchema = exports.KeyframeTrackSchema = exports.KeyframeSchema = exports.EmphasisPresetSchema = exports.ExitPresetSchema = exports.EntrancePresetSchema = exports.EasingSchema = exports.ElementLinkSchema = exports.CornerRadiusSchema = exports.EffectSchema = exports.AdjustmentOpSchema = exports.StrokeSchema = exports.FillSchema = exports.PatternFillSchema = exports.GradientFillSchema = exports.SolidFillSchema = exports.MeshPointSchema = exports.GradientStopSchema = exports.BlendModeSchema = exports.ConstraintsSchema = exports.SizeSchema = exports.TransformSchema = exports.ImageFillSchema = exports.ImageSourceSchema = exports.ClipPathSchema = exports.CropRectSchema = exports.ColorSchema = exports.UnitSchema = exports.MAX_NESTING_DEPTH = exports.CURRENT_SCHEMA_VERSION = void 0;
exports.SlideSectionSchema = exports.ThemeSchema = exports.SlideLayoutSchema = exports.SlideMasterSchema = exports.PlaceholderSchema = exports.PlaceholderRoleSchema = exports.NodeSchema = exports.KnownNodeSchema = exports.KNOWN_NODE_SCHEMAS = exports.UnknownNodeSchema = exports.StampNodeSchema = exports.DiagramCodeNodeSchema = exports.BoardViewNodeSchema = exports.MindMapNodeSchema = exports.InkNodeSchema = exports.StickyNodeSchema = exports.BooleanNodeSchema = exports.MaskNodeSchema = exports.ConnectorNodeSchema = exports.QRNodeSchema = exports.EmbedNodeSchema = exports.ChartNodeSchema = exports.ChartStyleSchema = exports.ChartTypeSchema = exports.ChartSeriesSchema = exports.TableNodeSchema = exports.TableConditionalRuleSchema = exports.DataBindingSchema = exports.TableBorderStyleSchema = exports.TableHeaderStyleSchema = exports.TableCellSchema = exports.AudioNodeSchema = exports.VideoNodeSchema = exports.GridNodeSchema = exports.GridCellSchema = exports.FrameNodeSchema = exports.FrameHeaderSchema = exports.AutoLayoutSchema = exports.GroupNodeSchema = exports.StickerNodeSchema = exports.IconNodeSchema = exports.PathNodeSchema = exports.PathContourSchema = exports.PathSegmentSchema = exports.LineNodeSchema = exports.ShapeNodeSchema = exports.ImageNodeSchema = exports.ImageAlphaMaskSchema = exports.TextNodeSchema = exports.TextEffectSchema = void 0;
exports.DesignFileSchema = exports.PageSchema = void 0;
exports.enabledEffects = enabledEffects;
exports.enabledTextEffects = enabledTextEffects;
exports.isKnownNodeType = isKnownNodeType;
const zod_1 = require("zod");
/** Bumped on any breaking change to the format; older files migrate forward.
 *  v2: rich text model (paragraphs/runs/styles) replaces the flat TextNode.
 *  v3: image model (source/normalized-crop/clip/focal) replaces the flat ImageNode.
 *  v4: unified color/fill model (Color {srgb,cmyk?,spot?}, consolidated GradientFill).
 *  v5: image effects/adjustments (duotone + extended adjustment ops; purely additive).
 *  v6: animation/interactivity (typed NodeAnimation, Interaction, PageTransition,
 *      ImageMotion; legacy single `animations[0]` lifts into `animation.entrance`).
 *  v7: chart styling (title/legend/axes/value-labels/per-series color) and table
 *      cell+header+border formatting (F27); all additive, older files open as-is.
 *  v8: whiteboard (F30) sticky node + free-form `meta.kind` document markers
 *      (whiteboard/doc/sheet/video); additive, older files open as-is.
 *  v9: per-range hyperlinks (CharStyle.link); additive, runs may omit it.
 *  v10: whiteboard board node types (F30) - ink, mindmap, boardview, diagramcode,
 *      stamp - plus additive optional fields on ConnectorNode (label/waypoints/
 *      jumpOver, EndPoint.attach.port), StickyNode (authorId/shape), and FrameNode
 *      (header/collapsed). All additive: older files omit them and open as-is.
 *  v11: presentations (F28) slide masters, layouts, placeholders, and a swappable
 *      deck Theme on DesignFile, plus Page.layoutId. All additive and optional:
 *      a v10 deck has none of them and opens unchanged.
 *  v12: accessibility (F28 FR-29): NodeBase.altText/decorative and
 *      Page.readingOrder. All additive and optional: a v11 file omits them,
 *      alt text falls back to ImageNode.alt, and reading order falls back to
 *      z-order, exactly as before.
 *  v13: presentations (F28 FR-5) slide sections: a DesignFile.sections registry
 *      and Page.sectionId membership. Additive and optional: a v12 deck has no
 *      sections, every page stands alone, and it opens unchanged.
 *  v14: effect normalization: Shadow.type becomes optional (absence means
 *      "drop", healing shadows early panels wrote without a type), and the
 *      migration stamps it plus bakes never-rendered text-shadow opacity to 1
 *      so existing designs keep their exact published appearance.
 *  v15: compound paths: PathNode gains optional `contours` (extra subpaths,
 *      filled together with the first under the even-odd rule) so imported
 *      vector line art keeps its interior holes. Additive: older files omit
 *      it and open unchanged.
 *  v16: chart text size: ChartStyle gains optional `fontSize` (base size in px;
 *      all chart text scales from it, absence means the built-in 11). Additive:
 *      older files omit it and render unchanged.
 *  v17: QR center logo size: QRNode gains optional `logoScale` (logo size as a
 *      fraction of the QR, absence means the default 0.22). Additive: a v16 file
 *      omits it and its QR logo renders at the default size unchanged.
 *  v18: document language (F38 FR-8): DesignFile gains optional `language`
 *      (a BCP 47 tag) naming the document's primary language for assistive
 *      technology and the tagged-PDF /Lang. Additive: a v17 file omits it and
 *      exports fall back to en-US as before. The migration copies a legacy
 *      `meta.language` up (importers wrote it there); meta keeps its copy.
 *  v19: per-effect enable. `Effect` and `TextEffect` each gain an optional
 *      `enabled`, so an effect can be switched off in the reorderable stack
 *      without losing its parameters. ABSENT MEANS ENABLED: every effect
 *      written before this omits the field and must keep rendering, so the
 *      flag can only ever turn something off. Spelled `enabled` rather than
 *      `disabled` because the Go renderers already honoured exactly this check
 *      before the schema declared it.
 *  v20: non-destructive background removal. `ImageNode` gains optional
 *      `alphaMask`, a grayscale asset reference applied over `source`.
 *      Removal previously overwrote `source` with the flattened cutout, which
 *      discarded the original pixels; keeping both makes the cutout a view
 *      rather than a replacement, and therefore undoable and refinable.
 *      Additive: a v19 file has no mask and renders exactly as before. */
exports.CURRENT_SCHEMA_VERSION = 20;
/** Maximum container nesting depth; guards traversal against stack overflow (FR-4). */
exports.MAX_NESTING_DEPTH = 32;
exports.UnitSchema = zod_1.z.enum(["px", "mm", "in", "pt"]);
const unit = zod_1.z.number();
const channel = zod_1.z.number().min(0).max(1);
const cmyk4 = zod_1.z.object({ c: channel, m: channel, y: channel, k: channel });
exports.ColorSchema = zod_1.z.object({
    srgb: zod_1.z.object({ r: channel, g: channel, b: channel, a: channel }),
    cmyk: cmyk4.optional(),
    spot: zod_1.z.object({ name: zod_1.z.string(), book: zod_1.z.string().optional(), fallback: cmyk4 }).optional(),
});
const ImageFitSchema = zod_1.z.enum(["contain", "cover", "stretch", "none"]);
// Normalized to the source (0..1, origin top-left); non-zero area.
exports.CropRectSchema = zod_1.z
    .object({ x: zod_1.z.number(), y: zod_1.z.number(), width: zod_1.z.number(), height: zod_1.z.number() })
    .refine((c) => c.width > 0 && c.height > 0, { message: "crop must have non-zero area" });
exports.ClipPathSchema = zod_1.z.object({
    kind: zod_1.z.enum(["rect", "ellipse", "shape", "freeform"]),
    d: zod_1.z.string().optional(),
    shapeRef: zod_1.z.string().optional(),
});
exports.ImageSourceSchema = zod_1.z.object({
    assetId: zod_1.z.string(),
    naturalWidth: zod_1.z.number().nonnegative(),
    naturalHeight: zod_1.z.number().nonnegative(),
    colorSpace: zod_1.z.enum(["srgb", "display-p3", "cmyk"]).optional(),
    previewKey: zod_1.z.string().optional(),
});
const focalSchema = zod_1.z.object({ x: channel, y: channel });
exports.ImageFillSchema = zod_1.z.object({
    type: zod_1.z.literal("image"),
    source: exports.ImageSourceSchema,
    fit: ImageFitSchema,
    crop: exports.CropRectSchema.optional(),
    focalPoint: focalSchema.optional(),
    opacity: channel.optional(),
});
exports.TransformSchema = zod_1.z.object({
    x: unit,
    y: unit,
    scaleX: zod_1.z.number(),
    scaleY: zod_1.z.number(),
    rotation: zod_1.z.number(),
    skewX: zod_1.z.number().optional(),
    skewY: zod_1.z.number().optional(),
    origin: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }).optional(),
});
exports.SizeSchema = zod_1.z.object({ width: unit, height: unit });
exports.ConstraintsSchema = zod_1.z.object({
    horizontal: zod_1.z.enum(["left", "right", "center", "stretch", "scale"]),
    vertical: zod_1.z.enum(["top", "bottom", "center", "stretch", "scale"]),
});
exports.BlendModeSchema = zod_1.z.enum([
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light",
    "difference", "exclusion", "hue", "saturation", "color", "luminosity",
]);
exports.GradientStopSchema = zod_1.z.object({ position: channel, color: exports.ColorSchema });
exports.MeshPointSchema = zod_1.z.object({ x: unit, y: unit, color: exports.ColorSchema });
exports.SolidFillSchema = zod_1.z.object({ type: zod_1.z.literal("solid"), color: exports.ColorSchema });
exports.GradientFillSchema = zod_1.z.object({
    type: zod_1.z.literal("gradient"),
    gradient: zod_1.z.enum(["linear", "radial", "conic", "mesh"]),
    stops: zod_1.z.array(exports.GradientStopSchema),
    angle: zod_1.z.number().optional(),
    center: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }).optional(),
    radius: zod_1.z.number().optional(),
    mesh: zod_1.z
        .object({
        rows: zod_1.z.number().int().positive(),
        cols: zod_1.z.number().int().positive(),
        points: zod_1.z.array(exports.MeshPointSchema),
    })
        .optional(),
});
exports.PatternFillSchema = zod_1.z.object({
    type: zod_1.z.literal("pattern"),
    assetId: zod_1.z.string(),
    scale: zod_1.z.number(),
    rotation: zod_1.z.number().optional(),
    repeat: zod_1.z.enum(["tile", "mirror", "no-repeat"]),
});
exports.FillSchema = zod_1.z.discriminatedUnion("type", [
    exports.SolidFillSchema,
    exports.GradientFillSchema,
    exports.PatternFillSchema,
    exports.ImageFillSchema,
]);
exports.StrokeSchema = zod_1.z.object({
    fill: exports.FillSchema,
    width: zod_1.z.number(),
    align: zod_1.z.enum(["inside", "center", "outside"]),
    cap: zod_1.z.enum(["butt", "round", "square"]),
    join: zod_1.z.enum(["miter", "round", "bevel"]),
    dash: zod_1.z.array(zod_1.z.number()).optional(),
    miterLimit: zod_1.z.number().optional(),
});
const shadowFields = {
    type: zod_1.z.enum(["drop", "inner"]).optional(),
    color: exports.ColorSchema,
    offsetX: unit,
    offsetY: unit,
    blur: zod_1.z.number(),
    spread: zod_1.z.number(),
};
exports.AdjustmentOpSchema = zod_1.z.object({ name: zod_1.z.string(), value: zod_1.z.number() });
const duotoneFields = {
    shadows: exports.ColorSchema,
    highlights: exports.ColorSchema,
    intensity: zod_1.z.number(),
};
/** Per-effect enable, for the reorderable effect stack.
 *
 *  ABSENT MEANS ENABLED. Every effect written before this field existed omits
 *  it and must keep rendering, so the flag can only ever turn something off.
 *
 *  Spelled `enabled` rather than `disabled` because the Go renderers already
 *  implemented exactly this check, in `effectsOf` and in both shadow paths of
 *  `composite.go`, before the schema ever declared the field. Introducing the
 *  opposite polarity would have left two conventions for one idea and a silent
 *  browser/server divergence the first time anything wrote one of them. */
const effectEnabled = { enabled: zod_1.z.boolean().optional() };
exports.EffectSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("shadow"), ...shadowFields, ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("blur"), radius: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("glow"), color: exports.ColorSchema, radius: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("outline"), color: exports.ColorSchema, width: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("adjustment"), ops: zod_1.z.array(exports.AdjustmentOpSchema), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("duotone"), ...duotoneFields, ...effectEnabled }),
]);
/** The effects that actually render: absent `enabled` counts as enabled. */
function enabledEffects(effects) {
    return (effects ?? []).filter((e) => e.enabled !== false);
}
/** The same rule for a text node's parallel stack. */
function enabledTextEffects(effects) {
    return (effects ?? []).filter((e) => e.enabled !== false);
}
exports.CornerRadiusSchema = zod_1.z.object({
    topLeft: zod_1.z.number(),
    topRight: zod_1.z.number(),
    bottomRight: zod_1.z.number(),
    bottomLeft: zod_1.z.number(),
});
exports.ElementLinkSchema = zod_1.z.object({
    kind: zod_1.z.enum(["url", "page", "anchor", "email"]),
    target: zod_1.z.string(),
});
exports.EasingSchema = zod_1.z.enum(["linear", "ease-in", "ease-out", "ease-in-out", "spring", "ease-in-cubic", "ease-out-cubic", "ease-out-back", "bounce"]);
exports.EntrancePresetSchema = zod_1.z.enum(["fade", "rise", "pan", "pop", "drift", "breathe-in", "typewriter", "word-wipe", "tumble", "stomp", "zoom-in"]);
exports.ExitPresetSchema = zod_1.z.enum(["fade-out", "sink", "pop-out", "drift-out", "tumble-out", "zoom-out"]);
exports.EmphasisPresetSchema = zod_1.z.enum(["pulse", "wiggle", "spin", "breathe", "tada", "flicker", "jiggle", "bob"]);
function animationClipSchema(preset) {
    return zod_1.z.object({
        preset,
        durationMs: zod_1.z.number().nonnegative(),
        delayMs: zod_1.z.number().nonnegative(),
        easing: exports.EasingSchema,
        startMode: zod_1.z.enum(["delay", "with-previous", "after-previous"]).optional(),
        bezier: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number(), zod_1.z.number(), zod_1.z.number()]).optional(),
    });
}
exports.KeyframeSchema = zod_1.z.object({
    t: zod_1.z.number().nonnegative(),
    dx: zod_1.z.number().optional(),
    dy: zod_1.z.number().optional(),
    scale: zod_1.z.number().optional(),
    rotate: zod_1.z.number().optional(),
    opacity: zod_1.z.number().optional(),
    easing: exports.EasingSchema.optional(),
});
exports.KeyframeTrackSchema = zod_1.z.object({
    durationMs: zod_1.z.number().positive(),
    loop: zod_1.z.boolean().optional(),
    keyframes: zod_1.z.array(exports.KeyframeSchema),
});
exports.NodeAnimationSchema = zod_1.z.object({
    entrance: animationClipSchema(exports.EntrancePresetSchema).optional(),
    exit: animationClipSchema(exports.ExitPresetSchema).optional(),
    emphasis: animationClipSchema(exports.EmphasisPresetSchema).optional(),
    custom: exports.KeyframeTrackSchema.optional(),
});
exports.InteractionActionSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("none") }),
    zod_1.z.object({
        kind: zod_1.z.literal("navigate"),
        to: zod_1.z.enum(["next", "prev", "first", "last", "page"]),
        pageId: zod_1.z.string().optional(),
    }),
    zod_1.z.object({ kind: zod_1.z.literal("open-link"), link: exports.ElementLinkSchema }),
]);
exports.InteractionSchema = zod_1.z.object({
    trigger: zod_1.z.enum(["click", "hover"]),
    action: exports.InteractionActionSchema,
});
exports.PageTransitionSchema = zod_1.z.object({
    type: zod_1.z.enum(["none", "fade", "slide", "push", "dissolve", "morph-lite", "wipe", "flip", "zoom", "morph"]),
    direction: zod_1.z.enum(["left", "right", "up", "down"]).optional(),
    durationMs: zod_1.z.number().nonnegative(),
});
exports.ImageMotionSchema = zod_1.z.object({
    kind: zod_1.z.enum(["kenburns", "parallax"]),
    intensity: zod_1.z.number().min(0).max(1),
});
const handle = zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() });
exports.VectorAnchorSchema = zod_1.z.object({
    x: unit,
    y: unit,
    inHandle: handle.optional(),
    outHandle: handle.optional(),
    corner: zod_1.z.boolean().optional(),
});
exports.SubPathSchema = zod_1.z.object({
    closed: zod_1.z.boolean(),
    anchors: zod_1.z.array(exports.VectorAnchorSchema),
});
exports.VectorPathSchema = zod_1.z.object({
    subpaths: zod_1.z.array(exports.SubPathSchema),
    fillRule: zod_1.z.enum(["nonzero", "evenodd"]),
});
exports.GuideSchema = zod_1.z.object({ axis: zod_1.z.enum(["x", "y"]), position: zod_1.z.number() });
exports.AssetRefSchema = zod_1.z.object({
    id: zod_1.z.string(),
    kind: zod_1.z.enum(["image", "video", "audio", "svg", "lottie", "model3d", "font"]),
    url: zod_1.z.string(),
    mime: zod_1.z.string(),
    width: zod_1.z.number().optional(),
    height: zod_1.z.number().optional(),
    durationMs: zod_1.z.number().optional(),
    checksum: zod_1.z.string().optional(),
});
exports.FontRefSchema = zod_1.z.object({
    id: zod_1.z.string(),
    family: zod_1.z.string(),
    source: zod_1.z.enum(["system", "google", "upload", "library"]),
    url: zod_1.z.string().optional(),
    axes: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
    files: zod_1.z
        .array(zod_1.z.object({
        style: zod_1.z.string(),
        url: zod_1.z.string(),
        format: zod_1.z.enum(["ttf", "otf", "woff", "woff2"]),
        variable: zod_1.z.boolean().optional(),
    }))
        .optional(),
    variableAxes: zod_1.z
        .array(zod_1.z.object({ tag: zod_1.z.string(), min: zod_1.z.number(), max: zod_1.z.number(), default: zod_1.z.number() }))
        .optional(),
});
exports.ColorSwatchSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    color: exports.ColorSchema,
});
// Node types with a concrete schema today. `model3d` is reserved/deferred
// (Section 2), so it is intentionally absent here and is validated by its base
// alone, like any newer/unknown type.
exports.KNOWN_NODE_TYPES = [
    "text", "image", "shape", "line", "path", "icon", "sticker",
    "group", "frame", "grid", "video", "audio", "table", "chart",
    "embed", "qr", "connector", "mask", "boolean", "sticky",
    "ink", "mindmap", "boardview", "diagramcode", "stamp",
];
const KNOWN_NODE_TYPE_SET = new Set(exports.KNOWN_NODE_TYPES);
function isKnownNodeType(type) {
    return KNOWN_NODE_TYPE_SET.has(type);
}
// Field map shared by every concrete node schema (excluding the `type` literal,
// which each node fixes itself so the union can discriminate on it).
const nodeBaseFields = {
    id: zod_1.z.string(),
    transform: exports.TransformSchema,
    size: exports.SizeSchema,
    opacity: channel,
    blendMode: exports.BlendModeSchema,
    effects: zod_1.z.array(exports.EffectSchema).optional(),
    constraints: exports.ConstraintsSchema.optional(),
    locked: zod_1.z.boolean().optional(),
    hidden: zod_1.z.boolean().optional(),
    name: zod_1.z.string().optional(),
    link: exports.ElementLinkSchema.optional(),
    animations: zod_1.z.array(zod_1.z.unknown()).optional(),
    animation: exports.NodeAnimationSchema.optional(),
    interaction: exports.InteractionSchema.optional(),
    altText: zod_1.z.string().optional(),
    decorative: zod_1.z.boolean().optional(),
    aspectLocked: zod_1.z.boolean().optional(),
    opticalAlign: zod_1.z.boolean().optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
};
/** Base fields common to every node, with `type` left open (used to validate
 *  unknown/newer node types by their base alone; see validate.ts, FR-3). */
exports.NodeBaseSchema = zod_1.z.object({ ...nodeBaseFields, type: zod_1.z.string() });
exports.TextRunSchema = zod_1.z.object({
    text: zod_1.z.string(),
    fontId: zod_1.z.string(),
    fontSize: zod_1.z.number(),
    weight: zod_1.z.number().min(100).max(900),
    italic: zod_1.z.boolean().optional(),
    letterSpacing: zod_1.z.number().optional(),
    lineHeight: zod_1.z.number().optional(),
    color: exports.ColorSchema.optional(),
    decoration: zod_1.z.array(zod_1.z.enum(["underline", "strikethrough"])).optional(),
    features: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
});
exports.CharStyleSchema = zod_1.z.object({
    fontFamily: zod_1.z.string(),
    fontStyle: zod_1.z.string(),
    axes: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
    fontSize: zod_1.z.number(),
    fill: exports.FillSchema,
    letterSpacing: zod_1.z.number().optional(),
    kerning: zod_1.z.union([zod_1.z.enum(["auto", "optical", "metric"]), zod_1.z.number()]).optional(),
    lineHeight: zod_1.z
        .union([zod_1.z.number(), zod_1.z.object({ mode: zod_1.z.enum(["auto", "multiple", "absolute"]), value: zod_1.z.number() })])
        .optional(),
    baselineShift: zod_1.z.number().optional(),
    case: zod_1.z.enum(["none", "upper", "lower", "title", "smallcaps"]).optional(),
    decoration: zod_1.z.array(zod_1.z.enum(["underline", "strikethrough"])).optional(),
    script: zod_1.z.enum(["normal", "sub", "super"]).optional(),
    language: zod_1.z.string().optional(),
    features: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
    link: zod_1.z.string().optional(),
});
exports.RunSchema = zod_1.z.object({
    text: zod_1.z.string(),
    style: exports.CharStyleSchema,
    charStyleId: zod_1.z.string().optional(),
    overrides: exports.CharStyleSchema.partial().optional(),
});
exports.ParagraphStyleSchema = zod_1.z.object({
    align: zod_1.z.enum(["left", "center", "right", "justify"]),
    direction: zod_1.z.enum(["ltr", "rtl", "auto"]),
    indentStart: zod_1.z.number().optional(),
    indentEnd: zod_1.z.number().optional(),
    firstLineIndent: zod_1.z.number().optional(),
    spaceBefore: zod_1.z.number().optional(),
    spaceAfter: zod_1.z.number().optional(),
    list: zod_1.z
        .object({ type: zod_1.z.enum(["bullet", "number", "checklist"]), level: zod_1.z.number().int(), marker: zod_1.z.string().optional() })
        .optional(),
    tabStops: zod_1.z.array(zod_1.z.number()).optional(),
    baseChar: exports.CharStyleSchema.partial().optional(),
});
exports.ParagraphSchema = zod_1.z.object({
    runs: zod_1.z.array(exports.RunSchema),
    style: exports.ParagraphStyleSchema,
    paraStyleId: zod_1.z.string().optional(),
    overrides: exports.ParagraphStyleSchema.partial().optional(),
});
exports.TextBoxSchema = zod_1.z.object({
    mode: zod_1.z.enum(["fixed", "autoHeight", "autoWidth"]),
    width: unit,
    height: unit,
    columns: zod_1.z.object({ count: zod_1.z.number().int().positive(), gutter: zod_1.z.number() }).optional(),
    padding: zod_1.z.object({ t: zod_1.z.number(), r: zod_1.z.number(), b: zod_1.z.number(), l: zod_1.z.number() }).optional(),
    autoFit: zod_1.z.object({ enabled: zod_1.z.boolean(), min: zod_1.z.number(), max: zod_1.z.number() }).optional(),
    verticalAlign: zod_1.z.enum(["top", "middle", "bottom"]).optional(),
});
exports.TextFlowSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("horizontal") }),
    zod_1.z.object({ kind: zod_1.z.literal("vertical"), columnOrder: zod_1.z.enum(["rtl", "ltr"]) }),
    zod_1.z.object({
        kind: zod_1.z.literal("path"),
        pathRef: zod_1.z.string(),
        offset: zod_1.z.number(),
        side: zod_1.z.enum(["above", "below", "inside", "outside"]),
        flip: zod_1.z.boolean().optional(),
    }),
    zod_1.z.object({ kind: zod_1.z.literal("arc"), curvature: zod_1.z.number() }),
]);
exports.TextEffectSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("shadow"), dx: zod_1.z.number(), dy: zod_1.z.number(), blur: zod_1.z.number(), color: exports.FillSchema, opacity: channel, ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("outline"), width: zod_1.z.number(), color: exports.FillSchema, join: zod_1.z.enum(["miter", "round", "bevel"]), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("glow"), radius: zod_1.z.number(), color: exports.FillSchema, intensity: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("echo"), offset: zod_1.z.number(), count: zod_1.z.number().int(), color: exports.FillSchema, ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("neon"), color: exports.FillSchema, intensity: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("splice"), thickness: zod_1.z.number(), offset: zod_1.z.number(), color: exports.FillSchema, ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("highlight"), color: exports.FillSchema, padding: zod_1.z.number(), radius: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("lift"), intensity: zod_1.z.number(), ...effectEnabled }),
    zod_1.z.object({ kind: zod_1.z.literal("hollow"), thickness: zod_1.z.number(), ...effectEnabled }),
]);
exports.TextNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("text"),
    box: exports.TextBoxSchema,
    content: zod_1.z.array(exports.ParagraphSchema),
    flow: exports.TextFlowSchema.optional(),
    textEffects: zod_1.z.array(exports.TextEffectSchema).optional(),
    styleRefs: zod_1.z.object({ defaultParagraph: zod_1.z.string().optional() }).optional(),
});
const cropSchema = zod_1.z.object({ x: unit, y: unit, width: unit, height: unit }); // pixel crop (video)
exports.ImageAlphaMaskSchema = zod_1.z.object({
    assetId: zod_1.z.string(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
});
exports.ImageNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("image"),
    source: exports.ImageSourceSchema,
    fit: ImageFitSchema,
    crop: exports.CropRectSchema.optional(),
    clip: exports.ClipPathSchema.optional(),
    focalPoint: focalSchema.optional(),
    flipX: zod_1.z.boolean().optional(),
    flipY: zod_1.z.boolean().optional(),
    effectivePpi: zod_1.z.number().optional(),
    motion: exports.ImageMotionSchema.optional(),
    alphaMask: exports.ImageAlphaMaskSchema.optional(),
    alt: zod_1.z.string().optional(),
});
exports.ShapeNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("shape"),
    shape: zod_1.z.enum(["rect", "ellipse", "polygon", "star", "triangle", "custom"]),
    cornerRadius: exports.CornerRadiusSchema.optional(),
    sides: zod_1.z.number().optional(),
    innerRadius: zod_1.z.number().optional(),
    pathData: zod_1.z.string().optional(),
    fills: zod_1.z.array(exports.FillSchema),
    stroke: exports.StrokeSchema.optional(),
});
const capSchema = zod_1.z.enum(["none", "arrow", "circle", "diamond"]);
exports.LineNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("line"),
    points: zod_1.z.array(zod_1.z.object({ x: unit, y: unit })).min(2),
    stroke: exports.StrokeSchema,
    startCap: capSchema.optional(),
    endCap: capSchema.optional(),
});
const pointSchema = zod_1.z.object({ x: unit, y: unit });
exports.PathSegmentSchema = zod_1.z.object({
    x: unit,
    y: unit,
    cIn: pointSchema.optional(),
    cOut: pointSchema.optional(),
    corner: zod_1.z.boolean().optional(),
});
exports.PathContourSchema = zod_1.z.object({
    segments: zod_1.z.array(exports.PathSegmentSchema),
    closed: zod_1.z.boolean(),
});
exports.PathNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("path"),
    segments: zod_1.z.array(exports.PathSegmentSchema),
    closed: zod_1.z.boolean(),
    contours: zod_1.z.array(exports.PathContourSchema).optional(),
    fills: zod_1.z.array(exports.FillSchema).optional(),
    stroke: exports.StrokeSchema.optional(),
});
exports.IconNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("icon"),
    assetId: zod_1.z.string(),
    fills: zod_1.z.array(exports.FillSchema).optional(),
});
exports.StickerNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("sticker"),
    assetId: zod_1.z.string(),
    animated: zod_1.z.boolean().optional(),
});
exports.GroupNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("group"),
    isolation: zod_1.z.boolean().optional(),
    get children() {
        return zod_1.z.array(exports.NodeSchema);
    },
    clip: zod_1.z.boolean().optional(),
});
exports.AutoLayoutSchema = zod_1.z.object({
    direction: zod_1.z.enum(["row", "column"]),
    gap: zod_1.z.number(),
    padding: zod_1.z.object({
        top: zod_1.z.number(),
        right: zod_1.z.number(),
        bottom: zod_1.z.number(),
        left: zod_1.z.number(),
    }),
    align: zod_1.z.enum(["start", "center", "end", "stretch"]),
});
exports.FrameHeaderSchema = zod_1.z.object({
    title: zod_1.z.string(),
    fill: exports.FillSchema.optional(),
    textColor: exports.ColorSchema.optional(),
});
exports.FrameNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("frame"),
    get children() {
        return zod_1.z.array(exports.NodeSchema);
    },
    clip: zod_1.z.boolean(),
    maskShape: zod_1.z.enum(["rect", "ellipse", "custom"]).optional(),
    maskPath: zod_1.z.string().optional(),
    fills: zod_1.z.array(exports.FillSchema).optional(),
    cornerRadius: exports.CornerRadiusSchema.optional(),
    autoLayout: exports.AutoLayoutSchema.optional(),
    header: exports.FrameHeaderSchema.optional(),
    collapsed: zod_1.z.boolean().optional(),
});
exports.GridCellSchema = zod_1.z.object({
    row: zod_1.z.number().int(),
    col: zod_1.z.number().int(),
    rowSpan: zod_1.z.number().int(),
    colSpan: zod_1.z.number().int(),
    childId: zod_1.z.string().optional(),
});
exports.GridNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("grid"),
    rows: zod_1.z.number().int().positive(),
    cols: zod_1.z.number().int().positive(),
    gap: zod_1.z.number(),
    cells: zod_1.z.array(exports.GridCellSchema),
    get children() {
        return zod_1.z.array(exports.NodeSchema);
    },
});
exports.VideoNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("video"),
    assetId: zod_1.z.string(),
    trimStartMs: zod_1.z.number().optional(),
    trimEndMs: zod_1.z.number().optional(),
    volume: channel,
    muted: zod_1.z.boolean().optional(),
    loop: zod_1.z.boolean().optional(),
    crop: cropSchema.optional(),
});
exports.AudioNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("audio"),
    assetId: zod_1.z.string(),
    trimStartMs: zod_1.z.number().optional(),
    trimEndMs: zod_1.z.number().optional(),
    volume: channel,
    fadeInMs: zod_1.z.number().optional(),
    fadeOutMs: zod_1.z.number().optional(),
});
exports.TableCellSchema = zod_1.z.object({
    row: zod_1.z.number().int(),
    col: zod_1.z.number().int(),
    rowSpan: zod_1.z.number().int(),
    colSpan: zod_1.z.number().int(),
    content: zod_1.z.array(exports.TextRunSchema),
    fill: exports.FillSchema.optional(),
    align: zod_1.z.enum(["left", "center", "right"]).optional(),
    textColor: exports.ColorSchema.optional(),
});
exports.TableHeaderStyleSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    fill: exports.FillSchema.optional(),
    textColor: exports.ColorSchema.optional(),
    bold: zod_1.z.boolean().optional(),
});
exports.TableBorderStyleSchema = zod_1.z.object({
    show: zod_1.z.boolean(),
    color: exports.ColorSchema.optional(),
    width: zod_1.z.number().nonnegative().optional(),
});
exports.DataBindingSchema = zod_1.z.object({
    kind: zod_1.z.enum(["inline", "url"]),
    csv: zod_1.z.string().optional(),
    url: zod_1.z.string().optional(),
    hasHeaderRow: zod_1.z.boolean().optional(),
    refreshedAt: zod_1.z.string().optional(),
});
exports.TableConditionalRuleSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("highlight"), op: zod_1.z.enum([">", "<", ">=", "<=", "==", "!="]), value: zod_1.z.number(), fill: exports.FillSchema.optional(), textColor: exports.ColorSchema.optional(), column: zod_1.z.number().int().optional() }),
    zod_1.z.object({ kind: zod_1.z.literal("colorScale"), min: exports.ColorSchema, max: exports.ColorSchema, column: zod_1.z.number().int().optional() }),
    zod_1.z.object({ kind: zod_1.z.literal("dataBar"), color: exports.ColorSchema, column: zod_1.z.number().int().optional() }),
]);
exports.TableNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("table"),
    rows: zod_1.z.number().int().nonnegative(),
    cols: zod_1.z.number().int().nonnegative(),
    colWidths: zod_1.z.array(zod_1.z.number()),
    rowHeights: zod_1.z.array(zod_1.z.number()),
    cells: zod_1.z.array(exports.TableCellSchema),
    borders: exports.StrokeSchema.optional(),
    headerStyle: exports.TableHeaderStyleSchema.optional(),
    borderStyle: exports.TableBorderStyleSchema.optional(),
    conditional: zod_1.z.array(exports.TableConditionalRuleSchema).optional(),
    binding: exports.DataBindingSchema.optional(),
});
exports.ChartSeriesSchema = zod_1.z.object({
    name: zod_1.z.string(),
    values: zod_1.z.array(zod_1.z.number()),
    color: exports.ColorSchema.optional(),
});
exports.ChartTypeSchema = zod_1.z.enum([
    "bar", "barStacked", "barGrouped", "line", "pie", "donut", "area",
    "scatter", "radar", "gauge", "funnel", "progress",
]);
exports.ChartStyleSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    legend: zod_1.z.object({ show: zod_1.z.boolean(), position: zod_1.z.enum(["top", "right", "bottom", "left"]) }).optional(),
    valueLabels: zod_1.z.boolean().optional(),
    fontSize: zod_1.z.number().positive().optional(),
    axes: zod_1.z
        .object({
        showX: zod_1.z.boolean().optional(),
        showY: zod_1.z.boolean().optional(),
        xLabel: zod_1.z.string().optional(),
        yLabel: zod_1.z.string().optional(),
    })
        .optional(),
});
exports.ChartNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("chart"),
    chartType: exports.ChartTypeSchema,
    series: zod_1.z.array(exports.ChartSeriesSchema),
    categories: zod_1.z.array(zod_1.z.string()),
    options: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    dataSourceId: zod_1.z.string().optional(),
    style: exports.ChartStyleSchema.optional(),
    binding: exports.DataBindingSchema.optional(),
});
exports.EmbedNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("embed"),
    provider: zod_1.z.string(),
    src: zod_1.z.string(),
    poster: zod_1.z.string().optional(),
});
exports.QRNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("qr"),
    value: zod_1.z.string(),
    ecLevel: zod_1.z.enum(["L", "M", "Q", "H"]),
    foreground: exports.ColorSchema,
    background: exports.ColorSchema,
    logoAssetId: zod_1.z.string().optional(),
    logoScale: zod_1.z.number().optional(),
    modules: zod_1.z.array(zod_1.z.array(zod_1.z.boolean())).optional(),
});
const CapSchema = zod_1.z.object({ kind: zod_1.z.enum(["none", "arrow", "triangle", "dot"]), size: zod_1.z.number() });
const EndPointSchema = zod_1.z.object({
    point: zod_1.z.object({ x: unit, y: unit }).optional(),
    attach: zod_1.z.object({ nodeId: zod_1.z.string(), anchor: zod_1.z.string(), port: zod_1.z.string().optional() }).optional(),
});
const ConnectorLabelSchema = zod_1.z.object({
    text: zod_1.z.string(),
    position: zod_1.z.number().min(0).max(1).optional(),
});
exports.ConnectorNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("connector"),
    route: zod_1.z.enum(["straight", "elbow", "curved"]),
    start: EndPointSchema,
    end: EndPointSchema,
    stroke: exports.StrokeSchema,
    startCap: CapSchema.optional(),
    endCap: CapSchema.optional(),
    label: ConnectorLabelSchema.optional(),
    waypoints: zod_1.z.array(zod_1.z.object({ x: unit, y: unit })).optional(),
    jumpOver: zod_1.z.boolean().optional(),
});
exports.MaskNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("mask"),
    maskShape: exports.VectorPathSchema,
    get child() {
        return exports.NodeSchema;
    },
    childInner: exports.TransformSchema.optional(),
});
exports.BooleanNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("boolean"),
    op: zod_1.z.enum(["union", "subtract", "intersect", "exclude"]),
    operands: zod_1.z.array(exports.ShapeNodeSchema),
    result: exports.VectorPathSchema.optional(),
    fills: zod_1.z.array(exports.FillSchema).optional(),
    stroke: exports.StrokeSchema.optional(),
});
exports.StickyNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("sticky"),
    text: zod_1.z.string(),
    fill: exports.FillSchema,
    textColor: exports.ColorSchema,
    fontFamily: zod_1.z.string().optional(),
    align: zod_1.z.enum(["left", "center", "right"]).optional(),
    fontScale: zod_1.z.number().positive(),
    autoSize: zod_1.z.boolean(),
    frameId: zod_1.z.string().optional(),
    authorId: zod_1.z.string().optional(),
    shape: zod_1.z.enum(["square", "rectangle", "circle"]).optional(),
});
const InkPointSchema = zod_1.z.object({
    x: unit,
    y: unit,
    p: zod_1.z.number().min(0).max(1).optional(),
    t: zod_1.z.number().optional(),
});
exports.InkNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("ink"),
    points: zod_1.z.array(InkPointSchema),
    smoothing: channel,
    seed: zod_1.z.number().optional(),
    brush: zod_1.z.object({
        width: zod_1.z.number().positive(),
        opacity: channel,
        color: exports.ColorSchema,
        mode: zod_1.z.enum(["pen", "marker", "highlighter"]),
    }),
});
const MindMapBranchSchema = zod_1.z.object({
    id: zod_1.z.string(),
    parentId: zod_1.z.string().nullable(),
    label: zod_1.z.string(),
    childIds: zod_1.z.array(zod_1.z.string()),
});
exports.MindMapNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("mindmap"),
    rootId: zod_1.z.string(),
    branches: zod_1.z.array(MindMapBranchSchema),
    direction: zod_1.z.enum(["radial", "right", "balanced"]),
});
const BoardViewColumnSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    cardIds: zod_1.z.array(zod_1.z.string()),
});
const BoardViewCardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    estimate: zod_1.z.number().optional(),
});
exports.BoardViewNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("boardview"),
    view: zod_1.z.enum(["kanban", "table", "timeline"]),
    columns: zod_1.z.array(BoardViewColumnSchema),
    cards: zod_1.z.array(BoardViewCardSchema),
});
exports.DiagramCodeNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("diagramcode"),
    lang: zod_1.z.enum(["mermaid", "plantuml", "dot"]),
    source: zod_1.z.string(),
    materializedIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.StampNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.literal("stamp"),
    kind: zod_1.z.enum(["emoji", "vote"]),
    glyph: zod_1.z.string(),
    authorId: zod_1.z.string().optional(),
});
exports.UnknownNodeSchema = zod_1.z.object({
    ...nodeBaseFields,
    type: zod_1.z.string().refine((t) => !isKnownNodeType(t), {
        message: "UnknownNode.type must not be a known node type",
    }),
    raw: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
/** Per-type schemas for every known node type, keyed by discriminator. */
exports.KNOWN_NODE_SCHEMAS = {
    text: exports.TextNodeSchema,
    image: exports.ImageNodeSchema,
    shape: exports.ShapeNodeSchema,
    line: exports.LineNodeSchema,
    path: exports.PathNodeSchema,
    icon: exports.IconNodeSchema,
    sticker: exports.StickerNodeSchema,
    group: exports.GroupNodeSchema,
    frame: exports.FrameNodeSchema,
    grid: exports.GridNodeSchema,
    video: exports.VideoNodeSchema,
    audio: exports.AudioNodeSchema,
    table: exports.TableNodeSchema,
    chart: exports.ChartNodeSchema,
    embed: exports.EmbedNodeSchema,
    qr: exports.QRNodeSchema,
    connector: exports.ConnectorNodeSchema,
    mask: exports.MaskNodeSchema,
    boolean: exports.BooleanNodeSchema,
    sticky: exports.StickyNodeSchema,
    ink: exports.InkNodeSchema,
    mindmap: exports.MindMapNodeSchema,
    boardview: exports.BoardViewNodeSchema,
    diagramcode: exports.DiagramCodeNodeSchema,
    stamp: exports.StampNodeSchema,
};
/** Discriminated union of all known node types (precise per-branch errors). */
exports.KnownNodeSchema = zod_1.z.discriminatedUnion("type", [
    exports.TextNodeSchema, exports.ImageNodeSchema, exports.ShapeNodeSchema, exports.LineNodeSchema,
    exports.PathNodeSchema, exports.IconNodeSchema, exports.StickerNodeSchema, exports.GroupNodeSchema,
    exports.FrameNodeSchema, exports.GridNodeSchema, exports.VideoNodeSchema, exports.AudioNodeSchema,
    exports.TableNodeSchema, exports.ChartNodeSchema, exports.EmbedNodeSchema, exports.QRNodeSchema,
    exports.ConnectorNodeSchema, exports.MaskNodeSchema, exports.BooleanNodeSchema, exports.StickyNodeSchema,
    exports.InkNodeSchema, exports.MindMapNodeSchema, exports.BoardViewNodeSchema, exports.DiagramCodeNodeSchema, exports.StampNodeSchema,
]);
/** Full recursive node schema (known types + unknown passthrough). */
exports.NodeSchema = zod_1.z.lazy(() => zod_1.z.union([exports.KnownNodeSchema, exports.UnknownNodeSchema]));
exports.PlaceholderRoleSchema = zod_1.z.enum(["title", "body", "content", "picture", "chart", "media", "footer"]);
exports.PlaceholderSchema = zod_1.z.object({
    id: zod_1.z.string(),
    role: exports.PlaceholderRoleSchema,
    rect: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number(), width: unit, height: unit }),
});
exports.SlideMasterSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
    background: exports.FillSchema.optional(),
    placeholders: zod_1.z.array(exports.PlaceholderSchema),
});
exports.SlideLayoutSchema = zod_1.z.object({
    id: zod_1.z.string(),
    masterId: zod_1.z.string(),
    name: zod_1.z.string(),
    background: exports.FillSchema.optional(),
    placeholders: zod_1.z.array(exports.PlaceholderSchema),
});
exports.ThemeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    colors: zod_1.z.array(exports.ColorSwatchSchema),
    fontHeading: zod_1.z.string().optional(),
    fontBody: zod_1.z.string().optional(),
    effects: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    variants: zod_1.z
        .array(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string().optional(), colors: zod_1.z.array(exports.ColorSwatchSchema) }))
        .optional(),
});
exports.SlideSectionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    color: zod_1.z.string().optional(),
    collapsed: zod_1.z.boolean().optional(),
});
exports.PageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    width: unit,
    height: unit,
    background: exports.FillSchema.optional(),
    bleed: zod_1.z.number().optional(),
    children: zod_1.z.array(exports.NodeSchema),
    guides: zod_1.z.array(exports.GuideSchema).optional(),
    notes: zod_1.z.string().optional(),
    transition: exports.PageTransitionSchema.optional(),
    layoutId: zod_1.z.string().optional(),
    sectionId: zod_1.z.string().optional(),
    readingOrder: zod_1.z.array(zod_1.z.string()).optional(),
    autoAdvanceMs: zod_1.z.number().optional(),
    hidden: zod_1.z.boolean().optional(),
    timelineDuration: zod_1.z.number().optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
exports.DesignFileSchema = zod_1.z.object({
    format: zod_1.z.union([zod_1.z.literal("hycanvas.design"), zod_1.z.literal("opencanva.design")]),
    schemaVersion: zod_1.z.number().int().nonnegative(),
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    unit: exports.UnitSchema,
    dpi: zod_1.z.number().positive(),
    colorProfile: zod_1.z.string().optional(),
    pages: zod_1.z.array(exports.PageSchema),
    masters: zod_1.z.array(exports.SlideMasterSchema).optional(),
    layouts: zod_1.z.array(exports.SlideLayoutSchema).optional(),
    theme: exports.ThemeSchema.optional(),
    sections: zod_1.z.array(exports.SlideSectionSchema).optional(),
    language: zod_1.z.string().optional(),
    assets: zod_1.z.array(exports.AssetRefSchema),
    fonts: zod_1.z.array(exports.FontRefSchema),
    palette: zod_1.z.array(exports.ColorSwatchSchema).optional(),
    meta: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
});
