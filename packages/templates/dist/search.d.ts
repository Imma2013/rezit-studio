import type { Template, TemplateQuery } from "./types";
/** Parse query-string-style params into a typed TemplateQuery (FR-2). */
export declare function filtersToTemplateQuery(params: Record<string, string | undefined>, workspaceId?: string | null): TemplateQuery;
export declare function templateMatches(t: Template, query: TemplateQuery): boolean;
/** Filter and relevance-rank templates for a query (FR-2, AC-1). */
export declare function searchTemplates(templates: Template[], query?: TemplateQuery): Template[];
