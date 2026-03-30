/**
 * ============================================================
 * Design System - Dream Team Mobile
 * Palette harmonisée : Bleu Océan + Or Cuivré + Émeraude
 * Cohérent avec le frontend web
 * ============================================================
 */

/** Palette de couleurs principale */
export const COLORS = {
  // Couleurs principales - Bleu Océan
  primary: '#1E3A5F',
  primaryDark: '#152C49',
  primaryDeep: '#0F1E33',
  primaryLight: '#2A5080',
  primarySoft: '#E8EDF5',

  // Accent doré pour les éléments premium
  accent: '#C8A45D',
  accentLight: '#E8D9B0',
  accentSoft: '#FBF5E8',
  accentDark: '#B8943D',

  // Émeraude - Succès et actions positives
  success: '#2D9D78',
  successLight: '#D0F0E4',
  successDark: '#1E7A5A',

  // États
  warning: '#E8A643',
  warningLight: '#FEF3D7',
  danger: '#E85D5D',
  dangerLight: '#FDE8E8',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Neutres
  white: '#FFFFFF',
  black: '#1A1D2E',
  gray50: '#F7F8FC',
  gray100: '#F1F3F9',
  gray200: '#E2E6EF',
  gray300: '#CBD2DE',
  gray400: '#9BA8C2',
  gray500: '#6B7A99',
  gray600: '#4A5568',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Fond d'écran
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Couleurs spécifiques Mobile Money
  orangeMoney: '#FF6600',
  mtnMomo: '#FFCC00',
  mtnMomoText: '#003D7C',

  // Gradients (pour expo-linear-gradient)
  primaryGradient: ['#1E3A5F', '#0F1E33'] as const,
  accentGradient: ['#C8A45D', '#B8943D'] as const,
  successGradient: ['#2D9D78', '#1E7A5A'] as const,
  warningGradient: ['#E8A643', '#D09535'] as const,
  dangerGradient: ['#E85D5D', '#D04444'] as const,
  darkGradient: ['#1E293B', '#0F172A'] as const,
  goldGradient: ['#C8A45D', '#B8943D'] as const,

  // Opacités utilitaires
  blackAlpha: (o: number) => `rgba(26, 29, 46, ${o})`,
  whiteAlpha: (o: number) => `rgba(255, 255, 255, ${o})`,
  primaryAlpha: (o: number) => `rgba(30, 58, 95, ${o})`,
  accentAlpha: (o: number) => `rgba(200, 164, 93, ${o})`,
};

/** Espacements cohérents (multiples de 4) */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/** Rayons de bordure */
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

/** Tailles de police */
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  title: 28,
  hero: 36,
};

/** Épaisseurs de police */
export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

/** Ombres portées */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#C8A45D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

/** Durées d'animation */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
