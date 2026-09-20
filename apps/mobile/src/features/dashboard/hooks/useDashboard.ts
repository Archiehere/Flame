import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { HOBBY_LEVEL_OPTIONS, HobbyLevel, LearningPlan } from '../../onboarding/types';
import {
  approveLearningPlan,
  createLearningPlan,
  getActiveLearningPlans,
  removeLearningPlan,
} from '../../../services/learningPlanApi';
import { CurrentUser, getCurrentUser } from '../../../services/userApi';
import { defaultFeaturedTargetDate } from '../featuredCourses';

export interface CourseSummary {
  planId: string;
  hobby: string;
  levelLabel: string;
  percentComplete: number;
  currentChapterId: string | null;
  currentChapterTitle: string | null;
}

interface DashboardState {
  isLoading: boolean;
  user: CurrentUser | null;
  courses: CourseSummary[];
  errorMessage: string | null;
}

function toCourseSummary(plan: LearningPlan): CourseSummary {
  const total = plan.chapters.length;
  const completed = plan.chapters.filter((c) => c.status === 'completed').length;
  const currentChapter = plan.chapters.find((c) => c.status === 'current');
  const levelLabel =
    HOBBY_LEVEL_OPTIONS.find((option) => option.value === plan.level)?.label ?? plan.level;

  return {
    planId: plan._id,
    hobby: plan.hobby,
    levelLabel,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    currentChapterId: currentChapter?._id ?? null,
    currentChapterTitle: currentChapter?.title ?? null,
  };
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    isLoading: true,
    user: null,
    courses: [],
    errorMessage: null,
  });

  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: !hasLoadedOnce.current, errorMessage: null }));
    try {
      const [user, plans] = await Promise.all([getCurrentUser(), getActiveLearningPlans()]);
      hasLoadedOnce.current = true;
      setState({
        isLoading: false,
        user,
        courses: plans.map(toCourseSummary),
        errorMessage: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        errorMessage: "Couldn't load your dashboard. Pull down to try again.",
      }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const removeCourse = useCallback(async (planId: string) => {
    await removeLearningPlan(planId);
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course.planId !== planId),
    }));
  }, []);

  const addFeaturedCourse = useCallback(
    async (hobby: string, level: HobbyLevel) => {
      const plan = await createLearningPlan({
        hobby,
        level,
        targetDate: defaultFeaturedTargetDate(),
      });
      await approveLearningPlan(plan._id);
      await load();
    },
    [load],
  );

  return { ...state, reload: load, removeCourse, addFeaturedCourse };
}
