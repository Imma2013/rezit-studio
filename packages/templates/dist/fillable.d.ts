import { type DesignFile } from "@hc/schema";
import type { FillableField } from "./types";
export interface FieldSpec {
    nodeId: string;
    label: string;
    hint?: string;
    constraints?: FillableField["constraints"];
}
export interface ExtractFieldsResult {
    fields: FillableField[];
    /** node ids requested but not found (dropped). */
    dropped: string[];
}
/** Build fillable-field definitions for the given node specs (FR-10). */
export declare function extractFillableFields(file: DesignFile, specs: FieldSpec[]): ExtractFieldsResult;
export interface FillValidation {
    ok: boolean;
    reason?: string;
}
/** Validate a value against a fillable field's constraints (fill time, FR-10). */
export declare function validateFill(field: FillableField, value: {
    text?: string;
    aspect?: number;
    present?: boolean;
}): FillValidation;
