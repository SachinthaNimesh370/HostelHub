/**
 * HostelHub Design Tokens
 * 2 Themes: Light Theme and Dark Theme
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Core
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    tint: '#4F46E5',

    // Brand
    primary: '#4F46E5',
    primaryLight: '#6366F1',
    primaryDark: '#3730A3',
    primaryGradientStart: '#4F46E5',
    primaryGradientEnd: '#7C3AED',

    // Semantic
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    dangerGradientStart: '#DC2626',
    dangerGradientEnd: '#EA580C',
    success: '#059669',
    successLight: '#D1FAE5',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    info: '#2563EB',
    infoLight: '#DBEAFE',

    // UI Elements
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
    inputBackground: '#F8FAFC',
    inputBorder: '#CBD5E1',
    inputFocusBorder: '#4F46E5',
    divider: '#E2E8F0',

    // Status colors (complaint tracking)
    statusSubmitted: '#2563EB',
    statusAssigned: '#D97706',
    statusInProgress: '#7C3AED',
    statusResolved: '#059669',

    // Tab bar
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#4F46E5',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',

    // Misc
    overlay: 'rgba(15, 23, 42, 0.5)',
    shimmer: '#E2E8F0',
  },
  dark: {
    // Core
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    background: '#0B0F19',
    surface: '#131B2E',
    tint: '#818CF8',

    // Brand
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    primaryGradientStart: '#6366F1',
    primaryGradientEnd: '#8B5CF6',

    // Semantic
    danger: '#EF4444',
    dangerLight: '#3B151E',
    dangerGradientStart: '#EF4444',
    dangerGradientEnd: '#F97316',
    success: '#10B981',
    successLight: '#062E20',
    warning: '#F59E0B',
    warningLight: '#332205',
    info: '#38BDF8',
    infoLight: '#0C2B47',

    // UI Elements
    card: '#131B2E',
    cardBorder: '#1E293B',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
    inputBackground: '#1E293B',
    inputBorder: '#334155',
    inputFocusBorder: '#818CF8',
    divider: '#1E293B',

    // Status colors (complaint tracking)
    statusSubmitted: '#38BDF8',
    statusAssigned: '#FBBF24',
    statusInProgress: '#A78BFA',
    statusResolved: '#34D399',

    // Tab bar
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
    tabBar: '#131B2E',
    tabBarBorder: '#1E293B',

    // Misc
    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: '#1E293B',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
