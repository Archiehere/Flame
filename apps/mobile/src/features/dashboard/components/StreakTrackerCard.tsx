import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadow, spacing } from '../../../theme/theme';
import { buildStreakDays } from '../weekDays';
import { DayTile } from './DayTile';

interface StreakTrackerCardProps {
  currentStreak: number;
}

export function StreakTrackerCard({ currentStreak }: StreakTrackerCardProps): React.JSX.Element {
  const router = useRouter();
  const recentDays = buildStreakDays(3, currentStreak);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View your streak"
      onPress={() => router.push('/streak')}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.headerText}>Track your streak and{'\n'}see each day</Text>

      <View style={styles.tiles}>
        {recentDays.map((day, index) => (
          <DayTile key={index} dayLetter={day.dayLetter} state={day.state} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: radii.md + 2,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow,
  },
  cardPressed: {
    opacity: 0.9,
  },
  headerText: {
    fontSize: 17,
    fontFamily: fonts.medium,
    color: colors.textOnPrimary,
    lineHeight: 22,
  },
  tiles: {
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
