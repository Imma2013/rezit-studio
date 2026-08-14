import { type DesignFile } from "@hc/schema";
import type { SvgOptions } from "./types";
/** Serialize a single page to an editable SVG document string. */
export declare function toSvg(file: DesignFile, pageIndex: number, opts?: SvgOptions): string;
