/**
 * DriveLegal Design System — Theme Constants
 *
 * Colors calibrated for WCAG AA (4.5:1 contrast on text).
 * Spacing follows an 8px grid. Touch targets ≥ 44×44.
 */

// ─── Colors ──────────────────────────────────────────────────
export const palette = {
  // Brand
  primary: '#1A73E8',
  primaryDark: '#1557B0',
  primaryLight: '#E8F0FE',
  primaryMid: '#4285F4',

  // Semantic
  accent: '#00C853',
  accentDark: '#009624',
  accentLight: '#E0F8EF',

  warning: '#FF9800',
  warningDark: '#E65100',
  warningLight: '#FFF3E0',

  danger: '#D32F2F',
  dangerDark: '#B71C1C',
  dangerLight: '#FDECEC',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
} as const;

export type PaletteColor = keyof typeof palette;

// ─── Theme Tokens ────────────────────────────────────────────
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  navBackground: string;
  navBorder: string;
  inputBackground: string;
  skeletonBase: string;
  skeletonHighlight: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  border: '#E5E9F2',
  borderStrong: '#C9D2E8',
  primary: palette.primary,
  primaryLight: palette.primaryLight,
  accent: palette.accent,
  accentLight: palette.accentLight,
  warning: palette.warning,
  warningLight: palette.warningLight,
  danger: palette.danger,
  dangerLight: palette.dangerLight,
  navBackground: '#FFFFFF',
  navBorder: '#E5E9F2',
  inputBackground: '#FFFFFF',
  skeletonBase: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',
  overlay: 'rgba(0,0,0,0.45)',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#273449',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  borderStrong: '#475569',
  primary: '#60A5FA',
  primaryLight: '#1E3A5F',
  accent: '#4ADE80',
  accentLight: '#14532D',
  warning: '#FB923C',
  warningLight: '#431407',
  danger: '#F87171',
  dangerLight: '#450A0A',
  navBackground: '#1E293B',
  navBorder: '#334155',
  inputBackground: '#273449',
  skeletonBase: '#334155',
  skeletonHighlight: '#475569',
  overlay: 'rgba(0,0,0,0.65)',
};

// ─── Typography ──────────────────────────────────────────────
export const typography = {
  fontFamily: {
    heading: 'Inter_700Bold',
    headingSemiBold: 'Inter_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    mono: 'NotoSans_400Regular',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 32,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;

// ─── Spacing (8px grid) ─────────────────────────────────────
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ─── Border Radius ───────────────────────────────────────────
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// ─── Touch Targets ───────────────────────────────────────────
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

// ─── Animation Durations ─────────────────────────────────────
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
  splash: 2000,
} as const;

// ─── Z-Index ─────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 50,
  modal: 100,
  toast: 200,
} as const;
