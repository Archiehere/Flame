import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../../../components/AppBackground';
import { colors, spacing } from '../../../theme/theme';
import { PillButton } from './PillButton';
import { useDashboard } from '../hooks/useDashboard';
import { LevelUpModal } from './LevelUpModal';
import { OngoingCourseSection } from './OngoingCourseSection';
import { ProfileHeader } from './ProfileHeader';
import { StreakTrackerCard } from './StreakTrackerCard';

export function DashboardScreen(): React.JSX.Element {
  const { isLoading, user, courses, errorMessage, reload, removeCourse } = useDashboard();
  const [rewardModalVisible, setRewardModalVisible] = useState(false);

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
          />

          <View style={styles.heading}>
            <Text style={styles.title}>Hi, ready to learn?</Text>
            <Text style={styles.subtitle}>Continue your streak and progress learning</Text>
          </View>

          <StreakTrackerCard onPressReward={() => setRewardModalVisible(true)} />

          <OngoingCourseSection courses={courses} onRemoveCourse={removeCourse} />
        </ScrollView>

        <LevelUpModal visible={rewardModalVisible} onClose={() => setRewardModalVisible(false)} />
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
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
