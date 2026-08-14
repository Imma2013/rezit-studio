import type { CellValue } from "@hc/formula";
import type { CellFormat, ConditionalRule } from "./model";
/**
 * Format a numeric value per a number-format string. Supported formats:
 *  - "" / "General": plain number
 *  - "0", "0.00", "0.000": fixed decimals
 *  - "#,##0", "#,##0.00": thousands separators (+ optional decimals)
 *  - "0%", "0.00%": percent
 *  - "$#,##0.00", "$#,##0": currency
 *  - "yyyy-mm-dd": date (value is a date-serial number)
 */
export declare function formatNumber(value: number, numberFormat: string): string;
/** Format a date-serial (number) or ISO string per "yyyy-mm-dd". */
export declare function formatDate(value: number | string, _fmt: string): string;
/** Format any display value through an optional number format. */
export declare function formatValue(value: CellValue, numberFormat?: string): string;
/**
 * Resolve the conditional format (if any) that applies to a cell.
 * Later rules in the list win when multiple match (last-writer-wins).
 */
export declare function applyConditionalFormat(value: CellValue, rules: ConditionalRule[], cellKeyStr: string): CellFormat | undefined;
