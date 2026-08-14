export type ToolParamType = "string" | "number" | "color" | "stringArray" | "series";
export interface ToolParam {
    name: string;
    type: ToolParamType;
    required?: boolean;
    description?: string;
}
export interface ToolDef {
    name: string;
    description: string;
    params: ToolParam[];
    /** Whether this action meaningfully changes the document (for plan preview /
     *  confirmation of large or destructive turns, FR-8). */
    mutates: boolean;
}
/** The catalog of actions the assistant may plan. Each maps 1:1 onto an editor
 *  store capability in the executor; keep names stable - they are the contract. */
export declare function toolCatalog(): ToolDef[];
export interface PlanStep {
    action: string;
    args: Record<string, unknown>;
    status: "planned" | "done" | "skipped" | "failed";
    reason?: string;
}
export interface AssistantResponse {
    /** A short natural-language reply to show the user. */
    reply: string;
    /** One focused clarifying question; when set, plan is empty (FR-10). */
    clarify?: string;
    plan: PlanStep[];
}
export declare class AssistantError extends Error {
}
/** Parse the model's reply into a validated AssistantResponse. Invalid steps are
 *  dropped (degrade gracefully); a clarify question short-circuits the plan. */
export declare function parseAssistantReply(parsed: unknown, catalog: ToolDef[]): AssistantResponse;
/** True when a plan contains a mutating step, used to gate confirmation. */
export declare function planMutates(plan: PlanStep[], catalog: ToolDef[]): boolean;
interface SummaryPage {
    name?: string;
    width: number;
    height: number;
    children: {
        type: string;
        name?: string;
    }[];
}
interface SummaryDoc {
    title?: string;
    pages: SummaryPage[];
}
/** A compact, token-bounded summary of the design for assistant context: page
 *  list, sizes, selection, and per-page element-type counts. Never the raw
 *  scene file (cost + privacy). */
export declare function summarizeDesign(doc: SummaryDoc, activePage: number, selectionCount: number): string;
/** System prompt for the assistant: choose actions from the catalog, return a
 *  validated JSON plan or one clarifying question. */
export declare function assistantSystemPrompt(catalog: ToolDef[], designSummary: string): string;
export {};
