export const Colors = {
  light: {
    primary: '#2D6AFF',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#2D6AFF',
    background: '#0F1419',
    surface: '#1A1F26',
    card: '#252D38',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export type ColorScheme = keyof typeof Colors;
