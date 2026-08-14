import { type Node } from "@hc/schema";
export interface WhiteboardTemplate {
    id: string;
    name: string;
}
export declare const WHITEBOARD_TEMPLATES: WhiteboardTemplate[];
/** Build a template's starter scene graph. Throws on an unknown id. */
export declare function buildTemplate(id: string): {
    nodes: Node[];
};
