import { useLocalSearchParams } from 'expo-router';
import { ChapterChecklistScreen } from '../../../src/features/course/components/ChapterChecklistScreen';

export default function ChapterRoute(): React.JSX.Element {
  const { planId, chapterId } = useLocalSearchParams<{ planId: string; chapterId: string }>();
  return <ChapterChecklistScreen planId={planId} chapterId={chapterId} />;
}
