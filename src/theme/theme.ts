/**
 * ============================================================
 * Design System - Dream Team Mobile
 * Palette premium, typographie, espacements et ombres
 * ============================================================
 */

/** Palette de couleurs principale */
export const COLORS = {
  // Couleurs principales - Dégradé violet/indigo signature
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryDeep: '#764ba2',
  primaryLight: '#a78bfa',
  primarySoft: '#ede9fe',

  // Accent doré pour les éléments premium
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  accentSoft: '#fef3c7',

  // États
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Neutres
  white: '#ffffff',
  black: '#0f172a',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',

  // Fond d'écran
  background: '#f0f2f8',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',

  // Couleurs spécifiques Mobile Money
  orangeMoney: '#ff6600',
  mtnMomo: '#ffcc00',
  mtnMomoText: '#003d7c',

  // Gradients (pour expo-linear-gradient)
  primaryGradient: ['#667eea', '#764ba2'] as const,
  successGradient: ['#10b981', '#059669'] as const,
  warningGradient: ['#f59e0b', '#d97706'] as const,
  dangerGradient: ['#ef4444', '#dc2626'] as const,
  darkGradient: ['#1e293b', '#0f172a'] as const,
  goldGradient: ['#f59e0b', '#d97706'] as const,
  sunsetGradient: ['#f97316', '#ef4444'] as const,

  // Opacités utilitaires
  blackAlpha: (o: number) => `rgba(15, 23, 42, ${o})`,
  whiteAlpha: (o: number) => `rgba(255, 255, 255, ${o})`,
  primaryAlpha: (o: number) => `rgba(102, 126, 234, ${o})`,
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

/** Ombres portées pour différents niveaux d'élévation */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
};

/** Durées d'animation en millisecondes */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
