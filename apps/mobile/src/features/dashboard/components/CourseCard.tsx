import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadow, spacing } from '../../../theme/theme';
import { getHobbyIcon } from '../hobbyIcons';
import { CourseSummary } from '../hooks/useDashboard';

interface CourseCardProps {
  course: CourseSummary;
  onRemove: () => void;
}

export function CourseCard({ course, onRemove }: CourseCardProps): React.JSX.Element {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/course/${course.planId}`)}
      style={styles.card}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove course"
        onPress={onRemove}
        hitSlop={8}
        style={styles.removeButton}
      >
        <Text style={styles.removeIcon}>×</Text>
      </Pressable>
      <Text style={styles.icon}>{getHobbyIcon(course.hobby)}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {`Learning ${course.hobby}`}
      </Text>
      <Text style={styles.percent}>{`${course.percentComplete}%`}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${course.percentComplete}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  removeButton: {
    position: 'absolute',
    top: 15,
    right: spacing.md,
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  removeIcon: {
    fontSize: 15,
    lineHeight: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  icon: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  title: {
    height: 40,
    fontSize: 18,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  percent: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressTrack: {
    marginTop: spacing.xxl,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.streak,
  },
});
