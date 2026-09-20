import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../../../theme/theme';
import { BoltIcon } from './BoltIcon';

export type DayTileState = 'streak' | 'done' | 'miss';

interface DayTileProps {
  dayLetter: string;
  state: DayTileState;
}

const DONE_ICON = '✓';

const LABELS: Record<DayTileState, string> = {
  streak: 'Streak',
  done: 'Done',
  miss: 'Miss',
};

export const DAY_TILE_WIDTH = 90;
export const DAY_TILE_HEIGHT = 100;

export function DayTile({ dayLetter, state }: DayTileProps): React.JSX.Element {
  const isStreak = state === 'streak';
  const isDone = state === 'done';
  const isFilled = isStreak || isDone;
  const isMiss = state === 'miss';

  return (
    <View style={styles.column}>
      <View style={[styles.tile, isStreak && styles.tileStreak, isMiss && styles.tileMiss]}>
        {isStreak && (
          <>
            <View style={[styles.dot, styles.dotSmall, styles.dot1]} />
            <View style={[styles.dot, styles.dotLarge, styles.dot2]} />
            <View style={[styles.dot, styles.dotSmall, styles.dot3]} />
            <View style={[styles.dot, styles.dotLarge, styles.dot4]} />
            <View style={[styles.dot, styles.dotSmall, styles.dot5]} />
          </>
        )}
        {isFilled ? (
          <View style={[styles.halo, isStreak ? styles.haloStreak : styles.haloDone]}>
            <View style={styles.iconCircleFilled}>
              {isStreak ? (
                <BoltIcon size={36} color={colors.textOnPrimary} />
              ) : (
                <Text style={[styles.icon, styles.iconFilled]}>{DONE_ICON}</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.iconCircleMiss}>
            <View style={styles.missRing} />
          </View>
        )}
        <Text style={[styles.label, isStreak && styles.labelStreak, isMiss && styles.labelMiss]}>
          {LABELS[state]}
        </Text>
      </View>
      <Text style={[styles.dayLetter, isStreak && styles.dayLetterActive]}>{dayLetter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLetter: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  dayLetterActive: {
    color: colors.primary,
  },
  tile: {
    width: DAY_TILE_WIDTH,
    height: DAY_TILE_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  tileStreak: {
    backgroundColor: colors.streak,
  },
  tileMiss: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dot: {
    position: 'absolute',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotSmall: {
    width: 5,
    height: 5,
  },
  dotLarge: {
    width: 8,
    height: 8,
  },
  dot1: {
    top: 12,
    left: 14,
  },
  dot2: {
    top: 16,
    right: 12,
  },
  dot3: {
    top: 30,
    left: 8,
  },
  dot4: {
    bottom: 14,
    left: 12,
  },
  dot5: {
    bottom: 18,
    right: 14,
  },
  halo: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloStreak: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  haloDone: {
    backgroundColor: colors.userBubble,
  },
  iconCircleFilled: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleMiss: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missRing: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.textOnPrimary,
  },
  icon: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  iconFilled: {
    color: colors.textOnPrimary,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  labelStreak: {
    color: colors.textOnPrimary,
  },
  labelMiss: {
    color: colors.textSecondary,
  },
});
