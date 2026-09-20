import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../../../components/AppBackground';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { CurrentUser, getCurrentUser } from '../../../services/userApi';
import { buildStreakDays, toCumulativePoints } from '../weekDays';
import { MonthCalendar } from './MonthCalendar';
import { StreakPointsChart } from './StreakPointsChart';

export function StreakScreen(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((result) => {
        if (!cancelled) {
          setUser(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  let canGoBack = false;
  try {
    canGoBack = router.canGoBack();
  } catch {
    // Navigation state isn't ready yet — treat as no back target.
  }

  const currentStreak = user?.currentStreak ?? 0;
  const isOnTrack = currentStreak > 0;
  const weekDays = buildStreakDays(7, currentStreak);
  const { labels, points } = toCumulativePoints(weekDays);

  return (
    <AppBackground>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          {canGoBack && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={8}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          )}
          <Text style={styles.headerTitle}>Your Streak</Text>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.pointsSection}>
              <Text testID="streakCount" style={styles.streakCount}>
                {currentStreak}
              </Text>
              <Text style={styles.streakLabel}>day streak</Text>
              <Text style={styles.streakSubtext}>
                {isOnTrack
                  ? "You're on a roll — keep it going!"
                  : 'Your streak reset. Finish a lesson today to start a new one.'}
              </Text>
              <StreakPointsChart labels={labels} points={points} />
            </View>

            <View style={styles.weekCard}>
              <MonthCalendar currentStreak={currentStreak} />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    alignItems: 'center',
  },
  pointsSection: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakCount: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  streakLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  streakSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  weekCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md + 4,
    padding: spacing.lg,
    ...shadow,
  },
});
