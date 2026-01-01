

export enum StylePreset {
  Clean = 'Clean',
  Dark = 'Dark'
}

export type AspectRatioPreset = 'custom' | '1:1' | '16:9' | '9:16' | '4:5' | '2:3' | '3:2';

export interface ShadowConfig {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export interface BorderConfig {
  width: number;
  color: string;
  opacity: number;
  radius: number;
}

export interface LightingConfig {
  enabled: boolean;
  opacity: number;
  direction: number; // degrees
}

export interface StudioState {
  // Mode: Card (Box) or Cutout (Drop Shadow)
  mode: 'card' | 'cutout';

  // Frame Dimensions (Output Size)
  frameWidth: number;
  frameHeight: number;
  aspectRatio: AspectRatioPreset;

  // Canvas
  canvasBgColor: string;
  
  // Image Container
  cardBgColor: string; // New: allow changing the card base color
  scale: number;
  rotate: number;
  
  // Styling
  borderRadius: number;
  
  // Shadows (Primary and Secondary for complex effects)
  shadow1: ShadowConfig;
  shadow2: ShadowConfig; // Used for Neumorphism/complex layering
  
  // Border & Glass
  border: BorderConfig;
  glassOpacity: number; // For background transparency (0-1)
  glassBlur: number;    // For backdrop-filter
  
  // Lighting (Inner gradients/reflections)
  lighting: LightingConfig;
}

export interface UploadedImage {
  id: string;
  name: string; // original filename
  src: string; // data url
  width: number; // Add this
  height: number; // Add this
}

export const DEFAULT_STATE: StudioState = {
  mode: 'card',
  frameWidth: 1080,
  frameHeight: 1080,
  aspectRatio: '1:1',
  canvasBgColor: '#F3F4F6',
  cardBgColor: '#FFFFFF',
  scale: 0.45, // Default to 0.45 (under 50% size)
  rotate: 0,
  borderRadius: 32,
  shadow1: {
    enabled: true,
    x: 0,
    y: 40, // Deeper shadow for better float
    blur: 60, // Softer blur
    spread: -10,
    color: '#0f172a',
    opacity: 0.25, // Slightly more visible
    inset: false,
  },
  shadow2: {
    enabled: false,
    x: 0,
    y: 0,
    blur: 0,
    spread: 0,
    color: '#000000',
    opacity: 0,
    inset: false,
  },
  border: {
    width: 0,
    color: '#ffffff',
    opacity: 1,
    radius: 32,
  },
  glassOpacity: 1,
  glassBlur: 0,
  lighting: {
    enabled: true,
    opacity: 0.05,
    direction: 135,
  }
};