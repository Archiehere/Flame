import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../theme/theme';
import { HobbyLevel } from '../../onboarding/types';
import { FEATURED_COURSES, hobbiesMatch } from '../featuredCourses';
import { CourseSummary } from '../hooks/useDashboard';
import { FeaturedCourseCard } from './FeaturedCourseCard';

interface FeaturedCoursesSectionProps {
  courses: CourseSummary[];
  onAddCourse: (hobby: string, level: HobbyLevel) => Promise<void>;
}

export function FeaturedCoursesSection({
  courses,
  onAddCourse,
}: FeaturedCoursesSectionProps): React.JSX.Element {
  const [addingHobby, setAddingHobby] = useState<string | null>(null);

  const handleAdd = async (hobby: string, level: HobbyLevel) => {
    setAddingHobby(hobby);
    try {
      await onAddCourse(hobby, level);
    } catch {
      Alert.alert('Something went wrong', "Couldn't add that course. Please try again.");
    } finally {
      setAddingHobby(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured courses</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
      >
        {FEATURED_COURSES.map((course) => (
          <FeaturedCourseCard
            key={course.hobby}
            title={course.title}
            hobby={course.hobby}
            description={course.description}
            isAdded={courses.some((active) => hobbiesMatch(active.hobby, course.hobby))}
            isAdding={addingHobby === course.hobby}
            onAdd={() => handleAdd(course.hobby, course.level)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
