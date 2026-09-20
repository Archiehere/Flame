import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../../../components/AppBackground';
import { PillButton } from '../../dashboard/components/PillButton';
import { colors, radii, spacing } from '../../../theme/theme';
import { useChapterChecklist } from '../hooks/useChapterChecklist';
import { ChecklistItemCard } from './ChecklistItemCard';

interface ChapterChecklistScreenProps {
  planId: string;
  chapterId: string;
}

export function ChapterChecklistScreen({
  planId,
  chapterId,
}: ChapterChecklistScreenProps): React.JSX.Element {
  const {
    isLoading,
    isGenerating,
    chapter,
    nextChapterId,
    errorMessage,
    isCompleting,
    reload,
    markComplete,
    toggleItem,
  } = useChapterChecklist(planId, chapterId);
  const router = useRouter();

  let canGoBack = false;
  try {
    canGoBack = router.canGoBack();
  } catch {
    // Navigation state isn't ready yet — treat as no back target.
  }

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
            {chapter?.title ?? 'Chapter'}
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

        {!isLoading && !errorMessage && isGenerating && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.preparingText}>Preparing your lesson…</Text>
            <Text style={styles.preparingSubtext}>This can take up to a minute.</Text>
          </View>
        )}

        {!isLoading && !errorMessage && !isGenerating && chapter && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.description}>{chapter.description}</Text>
            {chapter.checklistItems.map((item) => (
              <ChecklistItemCard
                key={item._id}
                item={item}
                onToggle={() => toggleItem(item._id)}
              />
            ))}

            <View style={styles.completionSection}>
              {chapter.status === 'completed' ? (
                <>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Chapter completed</Text>
                  </View>
                  {nextChapterId && (
                    <PillButton
                      label="Continue to next chapter"
                      onPress={() => router.replace(`/chapter/${planId}/${nextChapterId}`)}
                    />
                  )}
                </>
              ) : (
                <PillButton
                  label={isCompleting ? 'Marking complete…' : 'Mark chapter as completed'}
                  onPress={markComplete}
                  disabled={isCompleting}
                />
              )}
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
  preparingText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  preparingSubtext: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  completionSection: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  completedBadge: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.userBubble,
  },
  completedBadgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
