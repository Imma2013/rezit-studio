import { type VideoProject } from "./model";
export interface SceneInfo {
    id: string;
    startFrame: number;
    durationFrames: number;
    /** ids of the clips composing this scene, across tracks. */
    clipIds: string[];
}
/** Ordered scenes derived from element clips, earliest first. */
export declare function listScenes(project: VideoProject): SceneInfo[];
/** The scene (page) containing a timeline frame, or null. */
export declare function sceneAtFrame(project: VideoProject, frame: number): SceneInfo | null;
/** Re-pack scenes as contiguous blocks in `orderedIds` order: each scene's clips
 *  shift so the scene begins at the running start (intra-scene layer offsets are
 *  preserved). Scenes present in the project but missing from `orderedIds` keep
 *  their relative order at the end. Clips with no sceneId are untouched. */
export declare function packScenes(project: VideoProject, orderedIds: string[]): VideoProject;
