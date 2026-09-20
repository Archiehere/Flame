import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api';
import {
  approveLearningPlan,
  createLearningPlan,
  reviseLearningPlanChapters,
  updateLearningPlanChapters,
} from '../../../services/learningPlanApi';
import { getCurrentUser, updateUserName } from '../../../services/userApi';
import { ChapterInput, HobbyLevel, LearningPlan } from '../types';

export type OnboardingStep =
  | 'loading'
  | 'name'
  | 'hobby'
  | 'level'
  | 'target-date'
  | 'generating'
  | 'syllabus'
  | 'approved'
  | 'error';

interface OnboardingState {
  step: OnboardingStep;
  name: string;
  isReturningUser: boolean;
  hobby: string;
  hobbyNotes: string | null;
  hobbyDisplayText: string;
  level: HobbyLevel | null;
  targetDateIso: string | null;
  targetDateLabel: string | null;
  plan: LearningPlan | null;
  errorMessage: string | null;
  isApproving: boolean;
}

const initialState: OnboardingState = {
  step: 'loading',
  name: '',
  isReturningUser: false,
  hobby: '',
  hobbyNotes: null,
  hobbyDisplayText: '',
  level: null,
  targetDateIso: null,
  targetDateLabel: null,
  plan: null,
  errorMessage: null,
  isApproving: false,
};

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status === 0
      ? error.message
      : `Server error (${error.status}). ${error.message}`;
  }
  if (error instanceof Error) {
    return `Unexpected error: ${error.message}`;
  }
  return "Something went wrong generating your plan. Let's try again.";
}

export function useOnboardingFlow() {
  const [state, setState] = useState<OnboardingState>(initialState);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (cancelled) {
          return;
        }
        if (user.name) {
          setState((prev) => ({
            ...prev,
            name: user.name ?? '',
            isReturningUser: true,
            step: 'hobby',
          }));
        } else {
          setState((prev) => ({ ...prev, step: 'name' }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, step: 'name' }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name, step: 'hobby' }));
    updateUserName(name).catch(() => {
      // Non-critical: the name is only used for display, retry silently isn't worth blocking onboarding.
    });
  }, []);

  const selectHobby = useCallback((hobby: string, notes?: string, rawMessage?: string) => {
    setState((prev) => ({
      ...prev,
      hobby,
      hobbyNotes: notes ?? null,
      hobbyDisplayText: rawMessage ?? hobby,
      step: 'level',
    }));
  }, []);

  const selectLevel = useCallback((level: HobbyLevel) => {
    setState((prev) => ({ ...prev, level, step: 'target-date' }));
  }, []);

  const generatePlan = useCallback(
    async (hobby: string, level: HobbyLevel, targetDateIso: string, hobbyNotes: string | null) => {
      setState((prev) => ({ ...prev, step: 'generating', errorMessage: null }));

      try {
        const plan = await createLearningPlan({
          hobby,
          level,
          targetDate: targetDateIso,
          hobbyNotes: hobbyNotes ?? undefined,
        });
        setState((prev) => ({ ...prev, plan, step: 'syllabus' }));
      } catch (error) {
        console.error('[Flame] generatePlan failed:', error);
        setState((prev) => ({ ...prev, step: 'error', errorMessage: describeError(error) }));
      }
    },
    [],
  );

  const selectTargetDate = useCallback(
    async (targetDateIso: string, label: string) => {
      setState((prev) => ({ ...prev, targetDateIso, targetDateLabel: label }));

      if (!state.level) {
        return;
      }
      await generatePlan(state.hobby, state.level, targetDateIso, state.hobbyNotes);
    },
    [state.hobby, state.level, state.hobbyNotes, generatePlan],
  );

  const retryGeneratePlan = useCallback(async () => {
    if (!state.level || !state.targetDateIso) {
      return;
    }
    await generatePlan(state.hobby, state.level, state.targetDateIso, state.hobbyNotes);
  }, [state.hobby, state.level, state.targetDateIso, state.hobbyNotes, generatePlan]);

  const reviseChapters = useCallback(
    async (instruction: string): Promise<ChapterInput[]> => {
      if (!state.plan) {
        return [];
      }
      const plan = await reviseLearningPlanChapters(state.plan._id, instruction);
      setState((prev) => ({ ...prev, plan }));
      return plan.chapters.map(({ title, description, order, timeEstimateDays }) => ({
        title,
        description,
        order,
        timeEstimateDays,
      }));
    },
    [state.plan],
  );

  const submitAndApprove = useCallback(
    async (chapters: ChapterInput[]) => {
      if (!state.plan) {
        return;
      }

      setState((prev) => ({ ...prev, isApproving: true, errorMessage: null }));

      try {
        await updateLearningPlanChapters(state.plan._id, chapters);
        const plan = await approveLearningPlan(state.plan._id);
        setState((prev) => ({ ...prev, plan, step: 'approved', isApproving: false }));
      } catch {
        setState((prev) => ({
          ...prev,
          isApproving: false,
          errorMessage: "We couldn't start your plan. Please try again.",
        }));
      }
    },
    [state.plan],
  );

  const reset = useCallback(() => setState(initialState), []);

  return {
    ...state,
    selectName,
    selectHobby,
    selectLevel,
    selectTargetDate,
    retryGeneratePlan,
    reviseChapters,
    submitAndApprove,
    reset,
  };
}
