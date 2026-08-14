import type { BrandLintViolation, LintBrandKit } from "./types";
import type { DesignFile } from "@hc/schema";
export interface BrandGateResult {
    /** The effective policy applied (off when no kit / policy off). */
    policy: "off" | "warn" | "block";
    /** All violations found (empty when on-brand or policy is off). */
    violations: BrandLintViolation[];
    /** True when export/publish must be blocked: policy is block AND there is at
     *  least one non-info violation. Info-level (e.g. spacing) never blocks. */
    blocked: boolean;
}
/** Evaluate the brand gate for a design (FR-8). With no kit or policy "off" the
 *  result is always unblocked with no violations. Under "warn" violations are
 *  surfaced but never block; under "block" any error/warn violation blocks. */
export declare function evaluateBrandGate(file: DesignFile, kit: LintBrandKit | null): BrandGateResult;
