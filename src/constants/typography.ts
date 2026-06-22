/**
 * Shared typography constants
 * Font styles and sizes — will be extended with user Settings (fontSize, fontStyle)
 */
export const typography = {
  // Font sizes (base scale, adjustable via settings later)
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 42,
  },
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export type Typography = typeof typography;