import type { DesignNode, ShapeType } from './types';

export type EditorAction =
  | { type: 'set_text'; nodeId?: string; text: string }
  | { type: 'set_color'; nodeId?: string; color: string }
  | {
      type: 'set_font';
      nodeId?: string;
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string;
      textAlign?: 'left' | 'center' | 'right';
    }
  | {
      type: 'set_border';
      nodeId?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
    }
  | { type: 'set_shadow'; nodeId?: string; boxShadow: string }
  | { type: 'set_filter'; nodeId?: string; filter: string }
  | { type: 'set_opacity'; nodeId?: string; opacity: number }
  | { type: 'move'; nodeId?: string; x: number; y: number }
  | { type: 'resize'; nodeId?: string; width: number; height: number }
  | {
      type: 'add_text';
      text?: string;
      x?: number;
      y?: number;
      color?: string;
      fontSize?: number;
      fontWeight?: string;
    }
  | {
      type: 'add_shape';
      shapeType?: ShapeType;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      color?: string;
      borderRadius?: number;
    }
  | {
      type: 'add_image';
      src?: string;
      prompt?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }
  | { type: 'delete_node'; nodeId?: string }
  | { type: 'duplicate_node'; nodeId?: string }
  | { type: 'align'; alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' }
  | { type: 'apply_theme'; theme: 'cyber_purple' | 'sunset_minimal' | 'modern_clean' | 'warm_brutalist' | 'dark_neon' };

export const PRESET_THEMES: Record<
  string,
  {
    name: string;
    bg: string;
    accent: string;
    secondary: string;
    textColor: string;
    fontFamily: string;
    borderRadius: number;
    boxShadow: string;
  }
> = {
  cyber_purple: {
    name: 'Cyber Neon',
    bg: '#0d0221',
    accent: '#7138e8',
    secondary: '#ee4e9b',
    textColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 20,
    boxShadow: '0 20px 40px rgba(113, 56, 232, 0.35)',
  },
  sunset_minimal: {
    name: 'Warm Sunset',
    bg: '#1a0b2e',
    accent: '#ff5c00',
    secondary: '#ffb703',
    textColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 16,
    boxShadow: '0 16px 36px rgba(255, 92, 0, 0.3)',
  },
  modern_clean: {
    name: 'Clean Studio',
    bg: '#0f172a',
    accent: '#0284c7',
    secondary: '#14b8a6',
    textColor: '#f8fafc',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 12,
    boxShadow: '0 12px 28px rgba(2, 132, 199, 0.25)',
  },
  warm_brutalist: {
    name: 'Warm Brutalist',
    bg: '#fdfbf7',
    accent: '#d97706',
    secondary: '#b45309',
    textColor: '#1c1917',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8,
    boxShadow: '4px 4px 0px #1c1917',
  },
  dark_neon: {
    name: 'Dark Electric',
    bg: '#050508',
    accent: '#06b6d4',
    secondary: '#10b981',
    textColor: '#f0fdf4',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 18,
    boxShadow: '0 0 30px rgba(6, 182, 212, 0.35)',
  },
};

export function applyEditorActions(
  currentNodes: DesignNode[],
  actions: unknown[],
  targetNodeId?: string
): { nodes: DesignNode[]; applied: number } {
  let updated = [...currentNodes];
  let appliedCount = 0;

  for (const raw of actions) {
    if (!raw || typeof raw !== 'object') continue;
    const action = raw as EditorAction;

    switch (action.type) {
      case 'set_text': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) => (node.id === id ? { ...node, text: action.text } : node));
        appliedCount++;
        break;
      }
      case 'set_color': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) => (node.id === id ? { ...node, color: action.color } : node));
        appliedCount++;
        break;
      }
      case 'set_font': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) =>
          node.id === id
            ? {
                ...node,
                fontFamily: action.fontFamily ?? node.fontFamily,
                fontSize: action.fontSize ?? node.fontSize,
                fontWeight: action.fontWeight ?? node.fontWeight,
                textAlign: action.textAlign ?? node.textAlign,
              }
            : node
        );
        appliedCount++;
        break;
      }
      case 'set_border': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) =>
          node.id === id
            ? {
                ...node,
                borderColor: action.borderColor ?? node.borderColor,
                borderWidth: action.borderWidth ?? node.borderWidth,
                borderRadius: action.borderRadius ?? node.borderRadius,
              }
            : node
        );
        appliedCount++;
        break;
      }
      case 'set_shadow': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) => (node.id === id ? { ...node, boxShadow: action.boxShadow } : node));
        appliedCount++;
        break;
      }
      case 'set_filter': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) => (node.id === id ? { ...node, filter: action.filter as any } : node));
        appliedCount++;
        break;
      }
      case 'set_opacity': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) => (node.id === id ? { ...node, opacity: action.opacity } : node));
        appliedCount++;
        break;
      }
      case 'move': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) => (node.id === id ? { ...node, x: action.x, y: action.y } : node));
        appliedCount++;
        break;
      }
      case 'resize': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.map((node) =>
          node.id === id ? { ...node, width: action.width, height: action.height } : node
        );
        appliedCount++;
        break;
      }
      case 'add_text': {
        const nextNode: DesignNode = {
          id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          kind: 'text',
          text: action.text || 'New Heading',
          x: action.x ?? 80,
          y: action.y ?? 200,
          width: 320,
          height: 50,
          fontSize: action.fontSize ?? 28,
          fontWeight: action.fontWeight ?? '800',
          color: action.color ?? '#ffffff',
          fontFamily: 'Inter, sans-serif',
        };
        updated.push(nextNode);
        appliedCount++;
        break;
      }
      case 'add_shape': {
        const nextNode: DesignNode = {
          id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          kind: 'shape',
          shapeType: action.shapeType ?? 'rounded',
          x: action.x ?? 100,
          y: action.y ?? 100,
          width: action.width ?? 220,
          height: action.height ?? 120,
          color: action.color ?? '#7138e8',
          borderRadius: action.borderRadius ?? 16,
        };
        updated.push(nextNode);
        appliedCount++;
        break;
      }
      case 'add_image': {
        const nextNode: DesignNode = {
          id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          kind: 'image',
          src: action.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          prompt: action.prompt,
          x: action.x ?? 60,
          y: action.y ?? 60,
          width: action.width ?? 440,
          height: action.height ?? 280,
          borderRadius: 16,
        };
        updated.push(nextNode);
        appliedCount++;
        break;
      }
      case 'delete_node': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        updated = updated.filter((node) => node.id !== id);
        appliedCount++;
        break;
      }
      case 'duplicate_node': {
        const id = action.nodeId || targetNodeId;
        if (!id) break;
        const source = updated.find((node) => node.id === id);
        if (source) {
          updated.push({
            ...source,
            id: `${source.kind}-${Date.now()}`,
            x: source.x + 20,
            y: source.y + 20,
          });
          appliedCount++;
        }
        break;
      }
      case 'align': {
        if (action.alignment === 'center') {
          updated = updated.map((node) => ({
            ...node,
            x: Math.max(20, Math.round((560 - node.width) / 2)),
          }));
          appliedCount++;
        }
        break;
      }
      case 'apply_theme': {
        const theme = PRESET_THEMES[action.theme] || PRESET_THEMES.cyber_purple;
        updated = updated.map((node) => {
          if (node.kind === 'text') {
            return {
              ...node,
              color: theme.textColor,
              fontFamily: theme.fontFamily,
            };
          }
          if (node.kind === 'shape') {
            return {
              ...node,
              color: theme.accent,
              borderRadius: theme.borderRadius,
              boxShadow: theme.boxShadow,
            };
          }
          return node;
        });
        appliedCount++;
        break;
      }
    }
  }

  return { nodes: updated, applied: appliedCount };
}
