import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../theme/theme';
import { CourseSummary } from '../hooks/useDashboard';
import { AddCourseCard } from './AddCourseCard';
import { CourseCard } from './CourseCard';

interface OngoingCourseSectionProps {
  courses: CourseSummary[];
}

export function OngoingCourseSection({ courses }: OngoingCourseSectionProps): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ongoing course</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Coming soon', "You'll be able to view every course here.")}
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {courses.map((course) => (
          <CourseCard key={course.planId} course={course} />
        ))}
        <AddCourseCard onPress={() => router.push('/new-course')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
