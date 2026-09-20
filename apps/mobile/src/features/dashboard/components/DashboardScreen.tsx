import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../../../components/AppBackground';
import { colors, fonts, spacing } from '../../../theme/theme';
import { PillButton } from './PillButton';
import { useDashboard } from '../hooks/useDashboard';
import { FeaturedCoursesSection } from './FeaturedCoursesSection';
import { OngoingCourseSection } from './OngoingCourseSection';
import { ProfileHeader } from './ProfileHeader';
import { StreakTrackerCard } from './StreakTrackerCard';

export function DashboardScreen(): React.JSX.Element {
  const { isLoading, user, courses, errorMessage, reload, removeCourse, addFeaturedCourse } =
    useDashboard();

  if (isLoading) {
    return (
      <AppBackground style={styles.centered}>
        <SafeAreaView style={styles.flex}>
          <ActivityIndicator color={colors.primary} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (errorMessage) {
    return (
      <AppBackground style={styles.centered}>
        <SafeAreaView style={[styles.flex, styles.errorContainer]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <PillButton label="Try again" onPress={reload} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ProfileHeader
            name={user?.name ?? 'there'}
            levelLabel={courses[0]?.levelLabel ?? 'Beginner'}
            streakPoints={user?.currentStreak ?? 0}
          />

          <View style={styles.heading}>
            <Text style={styles.title}>Hi, Ready to learn?</Text>
            <Text style={styles.subtitle}>Continue streak and progress learning</Text>
          </View>

          <StreakTrackerCard currentStreak={user?.currentStreak ?? 0} />

          <OngoingCourseSection courses={courses} onRemoveCourse={removeCourse} />

          <FeaturedCoursesSection courses={courses} onAddCourse={addFeaturedCourse} />
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorContainer: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
