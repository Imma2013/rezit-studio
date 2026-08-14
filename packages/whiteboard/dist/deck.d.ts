import { type DesignFile } from "@hc/schema";
export interface DeckOptions {
    /** Slide width in px (default 1920, 16:9). */
    slideWidth?: number;
    /** Slide height in px (default 1080, 16:9). */
    slideHeight?: number;
    /** Title for the produced deck (default "<source> (deck)"). */
    title?: string;
}
export declare function whiteboardToDeck(design: DesignFile, opts?: DeckOptions): DesignFile;
