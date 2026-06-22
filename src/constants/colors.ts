/**
 * Lectify Color System
 * Exact colors as specified — used everywhere via theme
 */

export const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#7C3AED',
  primaryDark: '#4C1D95',
  primarySoft: '#DDD6FE',
  text: '#0A0A0A',
  textSecondary: '#888888',
  border: '#E5E5E5',
  error: '#E25C5C',
  card: '#FFFFFF',
  divider: '#E5E5E5',
} as const;

export const darkColors = {
  background: '#0A0A0A',
  surface: '#111111',
  primary: '#7C3AED',
  primaryDark: '#4C1D95',
  primarySoft: '#DDD6FE',
  text: '#FFFFFF',
  textSecondary: '#888888',
  border: '#222222',
  error: '#E25C5C',
  card: '#111111',
  divider: '#222222',
} as const;

export type Colors = typeof lightColors;