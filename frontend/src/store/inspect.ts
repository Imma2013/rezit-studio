// Visual AI Inspector Store for Rezit Studio v2
import { create } from "zustand";

export interface InspectState {
  inspectMode: boolean;
  hoveredNodeId: string | null;
  hoveredNodeLabel: string | null;
  hoveredNodeRect: { x: number; y: number; width: number; height: number } | null;
  
  targetNodeId: string | null;
  targetNodeLabel: string | null;
  targetNodeRect: { x: number; y: number; width: number; height: number } | null;
  popoverOpen: boolean;

  setInspectMode: (active: boolean) => void;
  toggleInspectMode: () => void;
  setHoveredNode: (
    id: string | null,
    label?: string | null,
    rect?: { x: number; y: number; width: number; height: number } | null,
  ) => void;
  setTargetNode: (
    id: string | null,
    label?: string | null,
    rect?: { x: number; y: number; width: number; height: number } | null,
  ) => void;
  closePopover: () => void;
}

export const useInspect = create<InspectState>((set) => ({
  inspectMode: false,
  hoveredNodeId: null,
  hoveredNodeLabel: null,
  hoveredNodeRect: null,

  targetNodeId: null,
  targetNodeLabel: null,
  targetNodeRect: null,
  popoverOpen: false,

  setInspectMode: (active) =>
    set((state) => ({
      inspectMode: active,
      hoveredNodeId: active ? state.hoveredNodeId : null,
      popoverOpen: active ? state.popoverOpen : false,
    })),

  toggleInspectMode: () =>
    set((state) => ({
      inspectMode: !state.inspectMode,
      hoveredNodeId: null,
      popoverOpen: false,
    })),

  setHoveredNode: (id, label = null, rect = null) =>
    set({
      hoveredNodeId: id,
      hoveredNodeLabel: label,
      hoveredNodeRect: rect,
    }),

  setTargetNode: (id, label = null, rect = null) =>
    set({
      targetNodeId: id,
      targetNodeLabel: label,
      targetNodeRect: rect,
      popoverOpen: Boolean(id),
    }),

  closePopover: () =>
    set({
      popoverOpen: false,
      targetNodeId: null,
      targetNodeRect: null,
    }),
}));
