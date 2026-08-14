"use strict";
// Export presets. A preset stores a reusable request with
// no design-specific data, so applying it reproduces all settings across any
// design. These are pure transforms; persistence and sharing are the API layer.
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPreset = toPreset;
exports.applyPreset = applyPreset;
/** Build a preset from a concrete request by dropping its `designId`. */
function toPreset(request, meta) {
    const { designId: _designId, ...rest } = request;
    void _designId;
    return { id: meta.id, name: meta.name, scope: meta.scope, request: rest };
}
/** Apply a preset to a design, reproducing every stored setting (AC-7). */
function applyPreset(preset, designId) {
    // Deep-clone so the returned request never aliases the stored preset.
    return { ...JSON.parse(JSON.stringify(preset.request)), designId };
}
