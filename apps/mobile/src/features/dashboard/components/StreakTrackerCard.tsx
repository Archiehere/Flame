import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadow, spacing } from '../../../theme/theme';
import { buildStreakDays } from '../weekDays';
import { DayTile } from './DayTile';

interface StreakTrackerCardProps {
  currentStreak: number;
}

export function StreakTrackerCard({ currentStreak }: StreakTrackerCardProps): React.JSX.Element {
  const router = useRouter();
  const weekDays = buildStreakDays(7, currentStreak);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View your streak"
        onPress={() => router.push('/streak')}
        style={({ pressed }) => pressed && styles.headerPressed}
      >
        <Text style={styles.headerText}>Track your streak and{'\n'}see each day</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tiles}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {weekDays.map((day, index) => (
          <DayTile key={index} dayLetter={day.dayLetter} state={day.state} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardDark,
    borderRadius: radii.md + 2,
    padding: spacing.lg,
    paddingLeft: 0,
    gap: spacing.lg,
    ...shadow,
  },
  headerPressed: {
    opacity: 0.7,
  },
  headerText: {
    fontSize: 17,
    paddingLeft: spacing.lg,
    fontFamily: fonts.semiBold,
    color: colors.textOnPrimary,
    lineHeight: 22,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
});
