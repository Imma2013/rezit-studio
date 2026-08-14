import type { VideoProject } from "./model";
/** Maximum allowed nesting depth before nesting is rejected. */
export declare const MAX_NEST_DEPTH = 16;
export type ResolveSequence = (sequenceId: string) => VideoProject | null;
/**
 * Validate that every nested sequence reference in a project resolves and that
 * the nesting forms no cycle and does not exceed MAX_NEST_DEPTH. Returns false
 * if any reference is unresolved, a cycle is found, or the depth limit is
 * exceeded.
 */
export declare function nestClipRefsValid(project: VideoProject, resolve: ResolveSequence): boolean;
/**
 * Would adding a clip that references `sequenceId` into `project` create a cycle?
 * True if the target sequence (transitively) references `project` itself, or if
 * resolving the target would exceed the depth limit. `project` is the project
 * being edited; if it is itself registered under some id, pass `selfId` so a
 * direct self-reference is detected.
 */
export declare function wouldCreateCycle(project: VideoProject, sequenceId: string, resolve: ResolveSequence, selfId?: string): boolean;
