export const colors = {
  background: '#F4F1FB',
  surface: '#FFFFFF',
  primary: '#8B7CF6',
  primaryPressed: '#7566E8',
  botBubble: '#FFFFFF',
  userBubble: '#E4DEFA',
  border: '#EAE7F8',
  textPrimary: '#231F3D',
  textSecondary: '#8B87A6',
  textOnPrimary: '#FFFFFF',
  danger: '#E5484D',
  streak: '#F4A24C',
  streakLight: '#FBE4C6',
  cardDark: '#B9ADEF',
  pillDark: '#231F3D',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const backgroundGradient = ['#D9CFF7', '#F1ECFC', '#FFFFFF'] as const;
export const backgroundGradientPoints = {
  start: { x: 1, y: 0 },
  end: { x: 0, y: 1 },
} as const;
export const shadow = {
  shadowColor: '#3A2F73',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;
