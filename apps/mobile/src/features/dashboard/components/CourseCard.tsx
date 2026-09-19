import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadow, spacing } from '../../../theme/theme';
import { getHobbyIcon } from '../hobbyIcons';
import { CourseSummary } from '../hooks/useDashboard';

interface CourseCardProps {
  course: CourseSummary;
}

export function CourseCard({ course }: CourseCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{getHobbyIcon(course.hobby)}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {`Learning ${course.hobby}`}
      </Text>
      <Text style={styles.percent}>{`${course.percentComplete}%`}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${course.percentComplete}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow,
  },
  icon: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  percent: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressTrack: {
    marginTop: spacing.xs,
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
