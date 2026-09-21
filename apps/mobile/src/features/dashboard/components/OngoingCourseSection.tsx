import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../../../theme/theme';
import { CourseSummary } from '../hooks/useDashboard';
import { MAX_COURSES, showCourseLimitAlert } from '../courseLimit';
import { AddCourseCard } from './AddCourseCard';
import { CourseCard } from './CourseCard';

interface OngoingCourseSectionProps {
  courses: CourseSummary[];
  onRemoveCourse: (planId: string) => Promise<void>;
}

export function OngoingCourseSection({
  courses,
  onRemoveCourse,
}: OngoingCourseSectionProps): React.JSX.Element {
  const router = useRouter();

  const confirmRemove = (course: CourseSummary) => {
    Alert.alert('Remove course', `Remove "${course.hobby}" from your dashboard?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onRemoveCourse(course.planId).catch(() =>
            Alert.alert('Something went wrong', "Couldn't remove that course. Try again."),
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ongoing course</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {courses.map((course) => (
          <CourseCard
            key={course.planId}
            course={course}
            onRemove={() => confirmRemove(course)}
          />
        ))}
        <AddCourseCard
          isAtLimit={courses.length >= MAX_COURSES}
          onPress={() => {
            if (courses.length >= MAX_COURSES) {
              showCourseLimitAlert();
              return;
            }
            router.push('/new-course');
          }}
        />
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
    fontSize: 24,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
