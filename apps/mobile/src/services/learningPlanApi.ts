import { ChapterInput, HobbyLevel, LearningPlan } from '../features/onboarding/types';
import { apiFetch } from './api';

export function createLearningPlan(input: {
  hobby: string;
  level: HobbyLevel;
  targetDate: string;
}): Promise<LearningPlan> {
  return apiFetch<LearningPlan>('/learning-plans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateLearningPlanChapters(
  planId: string,
  chapters: ChapterInput[],
): Promise<LearningPlan> {
  return apiFetch<LearningPlan>(`/learning-plans/${planId}/chapters`, {
    method: 'PATCH',
    body: JSON.stringify({ chapters }),
  });
}

export function reviseLearningPlanChapters(
  planId: string,
  instruction: string,
): Promise<LearningPlan> {
  return apiFetch<LearningPlan>(`/learning-plans/${planId}/revise`, {
    method: 'PATCH',
    body: JSON.stringify({ instruction }),
  });
}

export function approveLearningPlan(planId: string): Promise<LearningPlan> {
  return apiFetch<LearningPlan>(`/learning-plans/${planId}/approve`, {
    method: 'POST',
  });
}

export function getActiveLearningPlans(): Promise<LearningPlan[]> {
  return apiFetch<LearningPlan[]>('/learning-plans/active');
}

export function getChapterChecklist(planId: string, chapterId: string): Promise<LearningPlan> {
  return apiFetch<LearningPlan>(`/learning-plans/${planId}/chapters/${chapterId}/checklist`);
}

export function removeLearningPlan(planId: string): Promise<{ deleted: true }> {
  return apiFetch<{ deleted: true }>(`/learning-plans/${planId}`, {
    method: 'DELETE',
  });
}
