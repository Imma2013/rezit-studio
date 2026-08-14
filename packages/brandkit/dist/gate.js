"use strict";
// The pre-export / pre-publish gate. A pure decision over the
// linter's output and the kit's lint policy, consulted by the export path (doc
// 11) and publishing. Server-side defense in depth; the editor uses the
// same function so the warning/block it shows matches what the server enforces.
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateBrandGate = evaluateBrandGate;
const lint_1 = require("./lint");
/** Evaluate the brand gate for a design (FR-8). With no kit or policy "off" the
 *  result is always unblocked with no violations. Under "warn" violations are
 *  surfaced but never block; under "block" any error/warn violation blocks. */
function evaluateBrandGate(file, kit) {
    if (!kit || kit.controls.lintPolicy === "off") {
        return { policy: "off", violations: [], blocked: false };
    }
    const violations = (0, lint_1.lintDesign)(file, kit);
    const policy = kit.controls.lintPolicy;
    const blocked = policy === "block" && violations.some((v) => v.severity !== "info");
    return { policy, violations, blocked };
}
