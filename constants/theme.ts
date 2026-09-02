/**
 * HostelHub Design Tokens
 * Premium color palette for the hostel maintenance complaint app.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Core
    text: '#1A1D2E',
    textSecondary: '#6B7194',
    textTertiary: '#9CA3C4',
    background: '#F5F6FA',
    surface: '#FFFFFF',
    tint: '#5B5FE6',

    // Brand
    primary: '#5B5FE6',
    primaryLight: '#8184ED',
    primaryDark: '#4346B5',
    primaryGradientStart: '#5B5FE6',
    primaryGradientEnd: '#8B5CF6',

    // Semantic
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    dangerGradientStart: '#EF4444',
    dangerGradientEnd: '#F97316',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // UI Elements
    card: '#FFFFFF',
    cardBorder: '#E8EAF2',
    cardShadow: 'rgba(91, 95, 230, 0.08)',
    inputBackground: '#F0F1F8',
    inputBorder: '#DDE0EE',
    inputFocusBorder: '#5B5FE6',
    divider: '#E8EAF2',

    // Status colors (complaint tracking)
    statusSubmitted: '#3B82F6',
    statusAssigned: '#F59E0B',
    statusInProgress: '#8B5CF6',
    statusResolved: '#10B981',

    // Tab bar
    icon: '#9CA3C4',
    tabIconDefault: '#9CA3C4',
    tabIconSelected: '#5B5FE6',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8EAF2',

    // Misc
    overlay: 'rgba(26, 29, 46, 0.5)',
    shimmer: '#E8EAF2',
  },
  dark: {
    // Core
    text: '#F0F1F8',
    textSecondary: '#9CA3C4',
    textTertiary: '#6B7194',
    background: '#0F1019',
    surface: '#1A1D2E',
    tint: '#8184ED',

    // Brand
    primary: '#8184ED',
    primaryLight: '#A5A7F2',
    primaryDark: '#5B5FE6',
    primaryGradientStart: '#5B5FE6',
    primaryGradientEnd: '#8B5CF6',

    // Semantic
    danger: '#F87171',
    dangerLight: '#3B1616',
    dangerGradientStart: '#EF4444',
    dangerGradientEnd: '#F97316',
    success: '#34D399',
    successLight: '#0D3325',
    warning: '#FBBF24',
    warningLight: '#3B2F0A',
    info: '#60A5FA',
    infoLight: '#1E2A4A',

    // UI Elements
    card: '#1A1D2E',
    cardBorder: '#2A2D3E',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    inputBackground: '#252840',
    inputBorder: '#2A2D3E',
    inputFocusBorder: '#8184ED',
    divider: '#2A2D3E',

    // Status colors (complaint tracking)
    statusSubmitted: '#60A5FA',
    statusAssigned: '#FBBF24',
    statusInProgress: '#A78BFA',
    statusResolved: '#34D399',

    // Tab bar
    icon: '#6B7194',
    tabIconDefault: '#6B7194',
    tabIconSelected: '#8184ED',
    tabBar: '#1A1D2E',
    tabBarBorder: '#2A2D3E',

    // Misc
    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: '#2A2D3E',
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
    shadowColor: '#5B5FE6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#5B5FE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#5B5FE6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
