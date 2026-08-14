import type { DeckTheme } from "./outline";
/** Generate N distinct deck themes from a brand palette (if any) or curated
 *  defaults. Each variant differs in base hue and solid/gradient treatment.
 *  Brand fonts (FR-17), when supplied, apply to every variant. */
export declare function deckThemes(opts: {
    brandPalette?: string[];
    kicker?: string;
    count: number;
    fontHeading?: string;
    fontBody?: string;
    seed?: number;
}): DeckTheme[];
