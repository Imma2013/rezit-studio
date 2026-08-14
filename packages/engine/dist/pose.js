"use strict";
// Pose a design at an animation time: returns a deep-cloned
// DesignFile with every animated node's transform/opacity advanced to time tMs,
// composing entrance -> emphasis/custom (+ image motion) exactly like present
// mode. Pure (no canvas), so animated export can sample frames headlessly and
// the result matches on-screen playback.
Object.defineProperty(exports, "__esModule", { value: true });
exports.revealEntranceText = revealEntranceText;
exports.sequenceStarts = sequenceStarts;
exports.pageAnimationDuration = pageAnimationDuration;
exports.poseDesignAt = poseDesignAt;
const schema_1 = require("@hc/schema");
const animation_1 = require("./animation");
/** Reveal only the first `keep` characters across a rich-text node's runs (the
 *  "typewriter" effect), truncating in place on a cloned node. Later runs become
 *  empty so layout (line breaks, alignment) stays stable as text appears. */
function revealTextContent(node, keep) {
    const content = node.content;
    if (!Array.isArray(content))
        return;
    let budget = Math.max(0, Math.floor(keep));
    for (const para of content) {
        if (!para || !Array.isArray(para.runs))
            continue;
        for (const run of para.runs) {
            const len = run.text ? run.text.length : 0;
            if (budget >= len) {
                budget -= len;
                continue;
            }
            run.text = run.text ? run.text.slice(0, budget) : "";
            budget = 0;
        }
    }
}
/** Total character count across a text node's runs. */
function textLength(node) {
    const content = node.content;
    if (!Array.isArray(content))
        return 0;
    let n = 0;
    for (const para of content)
        for (const run of para.runs ?? [])
            n += run.text ? run.text.length : 0;
    return n;
}
/** Word count across a text node's runs (whitespace-delimited). */
function wordCount(node) {
    const content = node.content;
    if (!Array.isArray(content))
        return 0;
    const text = content.map((p) => (p.runs ?? []).map((r) => r.text ?? "").join("")).join(" ");
    const m = text.match(/\S+/g);
    return m ? m.length : 0;
}
/** Reveal only the first `keepWords` whole words across the runs (word-wipe). */
function revealTextWords(node, keepWords) {
    const content = node.content;
    if (!Array.isArray(content))
        return;
    let budget = Math.max(0, Math.floor(keepWords));
    // Walk runs char-by-char, counting word starts; cut once the budget is spent
    // and we hit the next whitespace boundary (so a revealed word stays whole).
    let inWord = false;
    let done = false;
    for (const para of content) {
        if (!para || !Array.isArray(para.runs))
            continue;
        for (const run of para.runs) {
            if (done) {
                run.text = "";
                continue;
            }
            const t = run.text ?? "";
            let out = "";
            for (let i = 0; i < t.length; i++) {
                const ws = /\s/.test(t[i]);
                if (!ws && !inWord) { // word start
                    if (budget <= 0) {
                        done = true;
                        break;
                    }
                    inWord = true;
                    budget -= 1;
                }
                else if (ws) {
                    inWord = false;
                }
                out += t[i];
            }
            run.text = out;
        }
    }
}
function compose(a, b) {
    const base = a ?? animation_1.IDENTITY_PATCH;
    return {
        dx: base.dx + b.dx,
        dy: base.dy + b.dy,
        scale: base.scale * b.scale,
        rotate: base.rotate + b.rotate,
        opacityMul: base.opacityMul * b.opacityMul,
    };
}
function applyPatch(node, patch) {
    const n = node;
    const t = n.transform;
    n.opacity = (0, animation_1.appliedOpacity)(n.opacity, patch.opacityMul);
    n.transform = {
        ...t,
        x: t.x + patch.dx,
        y: t.y + patch.dy,
        scaleX: t.scaleX * patch.scale,
        scaleY: t.scaleY * patch.scale,
        rotation: t.rotation + patch.rotate,
    };
}
/** Reveal a text node's content for a typewriter/word-wipe entrance at local time
 *  `tMs` (no-op for other presets / non-text / after the clip ends). Mutates the
 *  node in place, so callers pass a clone or restore afterward. Shared by the
 *  poser, the editor "Play" preview, and present mode so all three match. */
function revealEntranceText(node, clip, tMs) {
    if (node.type !== "text")
        return;
    if (clip.preset !== "typewriter" && clip.preset !== "word-wipe")
        return;
    if (tMs > clip.delayMs + clip.durationMs)
        return; // fully revealed once done
    const prog = (0, animation_1.entranceProgress)(clip, tMs);
    if (clip.preset === "word-wipe")
        revealTextWords(node, prog * wordCount(node));
    else
        revealTextContent(node, prog * textLength(node));
}
/** Effective entrance start (ms) per node id, resolving cross-element sequencing
 *  ("with previous" / "after previous") against sibling order. Only entrances
 *  participate; nodes without one are skipped. Exported so the live preview and
 *  present mode resolve sequencing identically to the poser/export. */
function sequenceStarts(nodes) {
    const starts = new Map();
    let prevStart = 0;
    let prevEnd = 0;
    for (const n of nodes) {
        const ent = n.animation?.entrance;
        if (!ent)
            continue;
        const mode = ent.startMode ?? "delay";
        const start = mode === "with-previous" ? prevStart : mode === "after-previous" ? prevEnd : ent.delayMs;
        starts.set(n.id, start);
        prevStart = start;
        prevEnd = start + ent.durationMs;
    }
    return starts;
}
/** The total animated duration of a page in ms (max over its nodes' entrance +
 *  emphasis/custom windows), for choosing an export length. Image motion loops,
 *  so it does not extend the total. */
function pageAnimationDuration(file, pageIndex = 0) {
    const page = file.pages[pageIndex];
    if (!page)
        return 0;
    const starts = sequenceStarts(page.children);
    let total = 0;
    const visit = (nodes) => {
        for (const n of nodes) {
            const anim = n.animation;
            if (anim) {
                // Honor cross-element sequencing: a clip can start after the previous one.
                const entStart = starts.get(n.id);
                const entEnd = anim.entrance ? (entStart ?? anim.entrance.delayMs) + anim.entrance.durationMs : 0;
                let end = entEnd;
                if (anim.emphasis)
                    end = Math.max(end, entEnd + (0, animation_1.clipEnd)(anim.emphasis));
                if (anim.custom)
                    end = Math.max(end, entEnd + anim.custom.durationMs);
                total = Math.max(total, end);
            }
            const kids = (0, schema_1.childrenOf)(n);
            if (kids.length)
                visit(kids);
        }
    };
    visit(page.children);
    return total;
}
/** Return a clone of `file` with page `pageIndex` posed at time `tMs`. */
function poseDesignAt(file, pageIndex, tMs) {
    const clone = structuredClone(file);
    const page = clone.pages[pageIndex];
    if (!page)
        return clone;
    const starts = sequenceStarts(page.children);
    const visit = (nodes) => {
        for (const n of nodes) {
            const anim = n.animation;
            const motion = n.type === "image" ? n.motion : undefined;
            if (anim || motion) {
                // Apply cross-element sequencing by overriding the entrance's effective
                // delay (so "after previous" starts when the previous element finishes).
                const entrance = anim?.entrance && starts.has(n.id)
                    ? { ...anim.entrance, delayMs: starts.get(n.id) }
                    : anim?.entrance;
                let patch = null;
                const entEnd = (0, animation_1.clipEnd)(entrance);
                if (entrance && tMs <= entEnd)
                    patch = (0, animation_1.entrancePatch)(entrance, tMs);
                else if (anim?.emphasis)
                    patch = (0, animation_1.emphasisPatch)(anim.emphasis, tMs - entEnd);
                else if (entrance)
                    patch = (0, animation_1.entrancePatch)(entrance, entEnd);
                if (anim?.custom)
                    patch = compose(patch, (0, animation_1.customPatch)(anim.custom, tMs - entEnd));
                if (motion)
                    patch = compose(patch, (0, animation_1.imageMotionPatch)(motion, tMs));
                if (patch)
                    applyPatch(n, patch);
                // Typewriter / word-wipe entrances reveal content over the clip (shared
                // helper, so live preview and present mode match exactly).
                if (entrance)
                    revealEntranceText(n, entrance, tMs);
            }
            const kids = (0, schema_1.childrenOf)(n);
            if (kids.length)
                visit(kids);
        }
    };
    visit(page.children);
    return clone;
}
