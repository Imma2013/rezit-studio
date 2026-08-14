import type { FormBlock, FormField, FormSubmission } from "./types";
/** Validate one field's value. Returns an error message, or null when valid.
 *  `submit` fields carry no value and never produce an error. */
export declare function validateField(field: FormField, value: unknown): string | null;
export interface SubmissionResult {
    ok: boolean;
    errors: Record<string, string>;
}
/** Validate a whole submission against a field list. Aggregates per-field
 *  errors keyed by field `name`. */
export declare function validateSubmission(fields: FormField[], values: Record<string, unknown>): SubmissionResult;
export interface FormHtmlOptions {
    /** Where the visitor submission posts (defaults to a relative endpoint). */
    action?: string;
    method?: "post" | "get";
    /** Name for the honeypot input the spam filter checks server-side. */
    honeypotName?: string;
}
/** Render a semantic <form> with labeled inputs per field, a honeypot trap, and
 *  a placeholder hidden token input (signed server-side at submit time). */
export declare function formToHtml(form: FormBlock, opts?: FormHtmlOptions): string;
/** Export submissions to a CSV string. Header columns are the field names; each
 *  row pulls each field's value from the submission (blank when absent). */
export declare function submissionsToCsv(fields: FormField[], submissions: FormSubmission[]): string;
