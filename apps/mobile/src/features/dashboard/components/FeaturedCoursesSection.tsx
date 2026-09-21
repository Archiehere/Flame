import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../../../theme/theme';
import { HobbyLevel } from '../../onboarding/types';
import { MAX_COURSES, showCourseLimitAlert } from '../courseLimit';
import { FEATURED_COURSES, FeaturedCourse, hobbiesMatch } from '../featuredCourses';
import { CourseSummary } from '../hooks/useDashboard';
import { FeaturedCoursePreview } from './FeaturedCoursePreview';
import { FeaturedCourseCard } from './FeaturedCourseCard';

interface FeaturedCoursesSectionProps {
  courses: CourseSummary[];
  onAddCourse: (hobby: string, level: HobbyLevel) => Promise<void>;
}

export function FeaturedCoursesSection({
  courses,
  onAddCourse,
}: FeaturedCoursesSectionProps): React.JSX.Element {
  const [selectedCourse, setSelectedCourse] = useState<FeaturedCourse | null>(null);
  const [addingHobby, setAddingHobby] = useState<string | null>(null);

  const addingRef = useRef(false);

  const handleAdd = async (hobby: string, level: HobbyLevel) => {
    if (courses.length >= MAX_COURSES) {
      showCourseLimitAlert();
      return;
    }
    if (addingRef.current) return;
    addingRef.current = true;
    setAddingHobby(hobby);
    try {
      await onAddCourse(hobby, level);
      setSelectedCourse(null);
    } catch {
      Alert.alert('Something went wrong', "Couldn't add that course. Please try again.");
    } finally {
      addingRef.current = false;
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
            isAtLimit={courses.length >= MAX_COURSES}
            isAdding={addingHobby === course.hobby}
            onPreview={() => setSelectedCourse(course)}
            onAdd={() => handleAdd(course.hobby, course.level)}
          />
        ))}
      </ScrollView>
      {selectedCourse && (
        <FeaturedCoursePreview
          course={selectedCourse}
          isAdded={courses.some((active) => hobbiesMatch(active.hobby, selectedCourse.hobby))}
          isAdding={addingHobby !== null}
          isAtLimit={courses.length >= MAX_COURSES}
          onClose={() => setSelectedCourse(null)}
          onAdd={() => handleAdd(selectedCourse.hobby, selectedCourse.level)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
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
