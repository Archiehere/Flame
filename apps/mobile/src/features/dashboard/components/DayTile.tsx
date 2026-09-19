import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../../theme/theme';

export type DayTileState = 'streak' | 'done' | 'miss' | 'pending';

interface DayTileProps {
  label: string;
  state: DayTileState;
}

const ICONS: Record<DayTileState, string> = {
  streak: '⚡',
  done: '✓',
  miss: '○',
  pending: '○',
};

export function DayTile({ label, state }: DayTileProps): React.JSX.Element {
  const isStreak = state === 'streak';

  return (
    <View style={[styles.tile, isStreak && styles.tileStreak]}>
      <View style={[styles.iconCircle, isStreak && styles.iconCircleStreak]}>
        <Text style={[styles.icon, isStreak && styles.iconStreak]}>{ICONS[state]}</Text>
      </View>
      <Text
        style={[
          styles.label,
          isStreak && styles.labelStreak,
          state === 'pending' && styles.labelMuted,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  tileStreak: {
    backgroundColor: colors.streak,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleStreak: {
    borderColor: colors.textOnPrimary,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  icon: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  iconStreak: {
    color: colors.textOnPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelStreak: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
  labelMuted: {
    opacity: 0.5,
  },
});
