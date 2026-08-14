import { type LayoutResult, type Size } from "./layout";
import { type QualityReport } from "./quality";
import { type DeckTheme, type DesignOutline } from "./outline";
export interface DeckPage extends LayoutResult {
    name: string;
    quality: QualityReport;
}
export interface DeckResult {
    title: string;
    pages: DeckPage[];
}
/** Lay out every outline page into a DeckPage. `dir` propagates RTL. */
export declare function layoutDeck(outline: DesignOutline, theme: DeckTheme, size: Size, opts?: {
    dir?: "ltr" | "rtl";
}): DeckResult;
