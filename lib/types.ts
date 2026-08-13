export type StudioMode = 'graphic' | 'video' | 'calendar' | 'assets';

export type DesignNodeKind = 'text' | 'shape' | 'image' | 'badge' | 'line';

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'rounded'
  | 'pill'
  | 'star'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'badge';

export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'contrast' | 'vintage' | 'cyber' | 'warm' | 'blur';

export type DesignNode = {
  id: string;
  kind: DesignNodeKind;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // degrees 0-360
  opacity?: number; // 0-1
  zIndex?: number;
  locked?: boolean;
  hidden?: boolean;
  flipX?: boolean;
  flipY?: boolean;

  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';

  // Appearance
  color?: string; // Text color or icon color
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
  shapeType?: ShapeType;
  gradient?: string;

  // Image specific
  src?: string;
  prompt?: string;
  filter?: ImageFilter;
  objectFit?: 'cover' | 'contain' | 'fill';
};

export type CanvasDimensionPreset = {
  id: string;
  name: string;
  width: number;
  height: number;
  icon?: string;
};

export type SnapGuide = {
  type: 'x' | 'y';
  position: number;
};

export type GraphicTemplate = {
  id: string;
  title: string;
  category: 'social' | 'marketing' | 'presentation' | 'poster' | 'badge';
  width: number;
  height: number;
  thumbnail?: string;
  nodes: DesignNode[];
};

export type SocialProvider = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'x' | 'linkedin';

export type TrackKind = 'video' | 'overlay' | 'text' | 'audio';
export type AspectRatio = '9:16' | '16:9' | '1:1';

export type VideoClip = {
  id: string;
  trackId: string;
  trackKind: TrackKind;
  label: string;
  start: number;
  duration: number;
  src?: string;
  color?: string;
  volume?: number;
  textOverlay?: string;
  fontSize?: number;
};
