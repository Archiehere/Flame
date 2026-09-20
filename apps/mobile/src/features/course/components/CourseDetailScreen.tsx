import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../../../components/AppBackground';
import { getHobbyIcon } from '../../dashboard/hobbyIcons';
import { PillButton } from '../../dashboard/components/PillButton';
import { colors, radii, spacing } from '../../../theme/theme';
import { Chapter } from '../../onboarding/types';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { ChapterListItem } from './ChapterListItem';
import { CourseProgressRing } from './CourseProgressRing';

interface CourseDetailScreenProps {
  planId: string;
}

function findResumeChapter(chapters: Chapter[]): Chapter | null {
  return (
    chapters.find((c) => c.status === 'current') ??
    chapters.find((c) => c.status !== 'locked') ??
    chapters[0] ??
    null
  );
}

export function CourseDetailScreen({ planId }: CourseDetailScreenProps): React.JSX.Element {
  const { isLoading, plan, errorMessage, reload } = useCourseDetail(planId);
  const router = useRouter();

  let canGoBack = false;
  try {
    canGoBack = router.canGoBack();
  } catch {
    // Navigation state isn't ready yet — treat as no back target.
  }

  const totalCount = plan?.chapters.length ?? 0;
  const completedCount = plan?.chapters.filter((c) => c.status === 'completed').length ?? 0;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const resumeChapter = plan ? findResumeChapter(plan.chapters) : null;

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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {plan ? `Learning ${plan.hobby}` : 'Course'}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {!isLoading && errorMessage && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={reload}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !errorMessage && plan && (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.progressSection}>
              <Text style={styles.hobbyIcon}>{getHobbyIcon(plan.hobby)}</Text>
              <CourseProgressRing
                percentComplete={percentComplete}
                completedCount={completedCount}
                totalCount={totalCount}
              />
            </View>

            {resumeChapter && (
              <PillButton
                label={
                  completedCount === totalCount && totalCount > 0
                    ? 'Review course'
                    : `Resume: ${resumeChapter.title}`
                }
                onPress={() => router.push(`/chapter/${planId}/${resumeChapter._id}`)}
              />
            )}

            <View style={styles.chapterList}>
              <Text style={styles.sectionTitle}>Chapters</Text>
              {plan.chapters.map((chapter, index) => (
                <ChapterListItem
                  key={chapter._id}
                  chapter={chapter}
                  index={index}
                  onPress={() => router.push(`/chapter/${planId}/${chapter._id}`)}
                />
              ))}
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
    gap: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  progressSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  hobbyIcon: {
    fontSize: 36,
  },
  chapterList: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});
