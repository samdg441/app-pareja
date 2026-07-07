// 4-color monochromatic palette system
// Each theme has: Background, Surface, Primary Light, Primary Medium, Primary Dark

export type ColorPalette = {
  background: string;
  surface: string;
  primaryLight: string;
  primaryMedium: string;
  primaryDark: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
};

export type ThemeName = 'blue' | 'green' | 'purple' | 'red' | 'amber';

export const blueTheme: ColorPalette = {
  background: '#E8F1F8',      // Very light blue
  surface: '#B8D4E8',         // Light blue
  primaryLight: '#7BA7C7',    // Medium-light blue
  primaryMedium: '#4A7FA3',   // Medium blue
  primaryDark: '#2D5A7A',     // Dark blue
  text: '#1A3A52',            // Very dark blue for text
  textMuted: '#5A7FA3',       // Muted blue
  border: '#7BA7C7',          // Border color
  error: '#C75A5A',           // Red for errors
  success: '#5AC78A',         // Green for success
};

export const greenTheme: ColorPalette = {
  background: '#E8F8E8',
  surface: '#B8E8B8',
  primaryLight: '#7AC77A',
  primaryMedium: '#4FA34F',
  primaryDark: '#2D7A2D',
  text: '#1A521A',
  textMuted: '#5FA35F',
  border: '#7AC77A',
  error: '#C75A5A',
  success: '#5AC78A',
};

export const purpleTheme: ColorPalette = {
  background: '#F0E8F8',
  surface: '#D4B8E8',
  primaryLight: '#B77AC7',
  primaryMedium: '#8F4FA3',
  primaryDark: '#6A2D7A',
  text: '#4A1A52',
  textMuted: '#9F5FA3',
  border: '#B77AC7',
  error: '#C75A5A',
  success: '#5AC78A',
};

export const redTheme: ColorPalette = {
  background: '#F8E8E8',
  surface: '#E8B8B8',
  primaryLight: '#C77A7A',
  primaryMedium: '#A34F4F',
  primaryDark: '#7A2D2D',
  text: '#521A1A',
  textMuted: '#A35F5F',
  border: '#C77A7A',
  error: '#C75A5A',
  success: '#5AC78A',
};

export const amberTheme: ColorPalette = {
  background: '#F8F4E8',
  surface: '#E8D8B8',
  primaryLight: '#C7B07A',
  primaryMedium: '#A38F4F',
  primaryDark: '#7A6A2D',
  text: '#52441A',
  textMuted: '#A3955F',
  border: '#C7B07A',
  error: '#C75A5A',
  success: '#5AC78A',
};

export const themes: Record<ThemeName, ColorPalette> = {
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
  red: redTheme,
  amber: amberTheme,
};

// Pixel art border width (creates the "blocky" look)
export const PIXEL_BORDER_WIDTH = 4;

// Shadow offset for pixel art effect
export const PIXEL_SHADOW_OFFSET = { width: 3, height: 3 };
