import { useLocalSearchParams } from 'expo-router';
import { CourseDetailScreen } from '../../src/features/course/components/CourseDetailScreen';

export default function CourseRoute(): React.JSX.Element {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  return <CourseDetailScreen planId={planId} />;
}
