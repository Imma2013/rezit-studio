export interface XmlElement {
    tag: string;
    attrs: Record<string, string>;
    children: XmlElement[];
    text: string;
}
/** Parse an XML document; returns the root element. Throws on malformed input. */
export declare function parseXml(source: string): XmlElement;
/** First descendant (depth-first) whose tag matches. */
export declare function findFirst(el: XmlElement, tag: string): XmlElement | null;
/** All descendants (depth-first) whose tag matches. */
export declare function findAll(el: XmlElement, tag: string): XmlElement[];
/** Direct children with the given tag. */
export declare function childrenOf(el: XmlElement, tag: string): XmlElement[];
/** First direct child with the given tag. */
export declare function childOf(el: XmlElement, tag: string): XmlElement | null;
