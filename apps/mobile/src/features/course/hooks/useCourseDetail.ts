import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { getLearningPlan } from '../../../services/learningPlanApi';
import { LearningPlan } from '../../onboarding/types';

interface CourseDetailState {
  isLoading: boolean;
  plan: LearningPlan | null;
  errorMessage: string | null;
}

export function useCourseDetail(planId: string) {
  const [state, setState] = useState<CourseDetailState>({
    isLoading: true,
    plan: null,
    errorMessage: null,
  });
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: !hasLoadedOnce.current,
      errorMessage: null,
    }));
    try {
      const plan = await getLearningPlan(planId);
      hasLoadedOnce.current = true;
      setState({ isLoading: false, plan, errorMessage: null });
    } catch {
      setState({
        isLoading: false,
        plan: null,
        errorMessage: "Couldn't load this course. Pull down to try again.",
      });
    }
  }, [planId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { ...state, reload: load };
}
