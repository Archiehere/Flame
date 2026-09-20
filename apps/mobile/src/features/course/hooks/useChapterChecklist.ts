import { useCallback, useEffect, useState } from 'react';
import { getChapterChecklist } from '../../../services/learningPlanApi';
import { Chapter } from '../../onboarding/types';

interface ChapterChecklistState {
  isLoading: boolean;
  chapter: Chapter | null;
  errorMessage: string | null;
}

export function useChapterChecklist(planId: string, chapterId: string) {
  const [state, setState] = useState<ChapterChecklistState>({
    isLoading: true,
    chapter: null,
    errorMessage: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
    try {
      const plan = await getChapterChecklist(planId, chapterId);
      const chapter = plan.chapters.find((c) => c._id === chapterId) ?? null;
      setState({ isLoading: false, chapter, errorMessage: null });
    } catch {
      setState({
        isLoading: false,
        chapter: null,
        errorMessage: "Couldn't load this chapter. Please try again.",
      });
    }
  }, [planId, chapterId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
