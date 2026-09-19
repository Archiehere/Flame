import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { DayTile, DayTileState } from './DayTile';
import { PillButton } from './PillButton';

interface StreakTrackerCardProps {
  onPressReward: () => void;
}

// Static preview until real streak history is wired up.
const PREVIEW_DAYS: { label: string; state: DayTileState }[] = [
  { label: 'Miss', state: 'miss' },
  { label: 'Done', state: 'done' },
  { label: 'Streak', state: 'streak' },
  { label: 'Pending', state: 'pending' },
];

export function StreakTrackerCard({ onPressReward }: StreakTrackerCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Track your streak{'\n'}and see each day</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Streak options"
          onPress={() => Alert.alert('Coming soon', 'Streak details are on the way!')}
          hitSlop={8}
        >
          <Text style={styles.menuDots}>•••</Text>
        </Pressable>
      </View>

      <View style={styles.tiles}>
        {PREVIEW_DAYS.map((day) => (
          <DayTile key={day.label} label={day.label} state={day.state} />
        ))}
      </View>

      <PillButton label="Get a reward" onPress={onPressReward} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: radii.md + 4,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textOnPrimary,
    lineHeight: 20,
    flexShrink: 1,
  },
  menuDots: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
