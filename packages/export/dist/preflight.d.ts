import { type DesignFile } from "@hc/schema";
import { type ExportRequest, type PreflightReport } from "./types";
/**
 * Run pre-flight for an export request over its selected pages. Pure: no I/O.
 */
export declare function preflight(file: DesignFile, request: ExportRequest): PreflightReport;
