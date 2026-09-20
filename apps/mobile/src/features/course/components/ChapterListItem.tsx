import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { Chapter } from '../../onboarding/types';

interface ChapterListItemProps {
  chapter: Chapter;
  index: number;
  onPress: () => void;
}

const STATUS_ICON: Record<Chapter['status'], string> = {
  completed: '✓',
  current: '▶',
  locked: '🔒',
};

function getStatusBadgeStyle(status: Chapter['status']) {
  switch (status) {
    case 'completed':
      return styles.statusBadge_completed;
    case 'current':
      return styles.statusBadge_current;
    case 'locked':
      return styles.statusBadge_locked;
  }
}

export function ChapterListItem({
  chapter,
  index,
  onPress,
}: ChapterListItemProps): React.JSX.Element {
  const locked = chapter.status === 'locked';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        chapter.status === 'current' && styles.currentCard,
        locked && styles.lockedCard,
        pressed && !locked && styles.pressed,
      ]}
    >
      <View style={[styles.statusBadge, getStatusBadgeStyle(chapter.status)]}>
        <Text style={styles.statusIcon}>{STATUS_ICON[chapter.status]}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.chapterLabel}>{`Chapter ${index + 1}`}</Text>
        <Text style={[styles.title, locked && styles.lockedText]} numberOfLines={1}>
          {chapter.title}
        </Text>
        <Text style={[styles.description, locked && styles.lockedText]} numberOfLines={2}>
          {chapter.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow,
  },
  currentCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  lockedCard: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge_completed: {
    backgroundColor: colors.primary,
  },
  statusBadge_current: {
    backgroundColor: colors.streak,
  },
  statusBadge_locked: {
    backgroundColor: colors.border,
  },
  statusIcon: {
    fontSize: 15,
    color: colors.surface,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  chapterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  lockedText: {
    color: colors.textSecondary,
  },
});
