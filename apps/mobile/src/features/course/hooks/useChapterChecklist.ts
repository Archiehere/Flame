import { useCallback, useEffect, useRef, useState } from 'react';
import {
  completeChapter,
  getChapterChecklist,
  toggleChecklistItem,
} from '../../../services/learningPlanApi';
import { Chapter, ChecklistItemStatus } from '../../onboarding/types';

interface ChapterChecklistState {
  isLoading: boolean;
  isGenerating: boolean;
  chapter: Chapter | null;
  nextChapterId: string | null;
  errorMessage: string | null;
}

// A chapter's checklist is generated lazily on first visit — an LLM call
// plus video lookups that would otherwise outlast the network's fetch
// timeout if the request blocked on it. The server instead kicks off
// generation in the background and responds immediately with
// `generating: true`; we poll at this interval until it's done, so a slow
// generation shows a "preparing" state instead of a false failure.
const POLL_INTERVAL_MS = 2000;

// Genuine network failures (unrelated to generation time, since the
// endpoint now always responds quickly) still get a couple of quiet
// retries before surfacing an error.
const NETWORK_RETRY_DELAYS_MS = [1500, 3000];

export function useChapterChecklist(planId: string, chapterId: string) {
  const [state, setState] = useState<ChapterChecklistState>({
    isLoading: true,
    isGenerating: false,
    chapter: null,
    nextChapterId: null,
    errorMessage: null,
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const clearPoll = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const load = useCallback(async () => {
    clearPoll();
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

    const attemptFetch = async (networkAttempt: number): Promise<void> => {
      try {
        const { plan, generating } = await getChapterChecklist(planId, chapterId);
        if (requestIdRef.current !== requestId) {
          return;
        }

        const index = plan.chapters.findIndex((c) => c._id === chapterId);
        const chapter = index >= 0 ? plan.chapters[index] : null;
        const nextChapterId = index >= 0 ? (plan.chapters[index + 1]?._id ?? null) : null;

        setState({
          isLoading: false,
          isGenerating: generating,
          chapter: chapter ?? null,
          nextChapterId,
          errorMessage: null,
        });

        if (generating) {
          pollTimeoutRef.current = setTimeout(() => {
            attemptFetch(0);
          }, POLL_INTERVAL_MS);
        }
      } catch {
        if (requestIdRef.current !== requestId) {
          return;
        }
        if (networkAttempt >= NETWORK_RETRY_DELAYS_MS.length) {
          setState({
            isLoading: false,
            isGenerating: false,
            chapter: null,
            nextChapterId: null,
            errorMessage: "Couldn't load this chapter. Please try again.",
          });
          return;
        }
        pollTimeoutRef.current = setTimeout(() => {
          attemptFetch(networkAttempt + 1);
        }, NETWORK_RETRY_DELAYS_MS[networkAttempt]);
      }
    };

    await attemptFetch(0);
  }, [planId, chapterId, clearPoll]);

  useEffect(() => {
    load();
    return () => {
      requestIdRef.current += 1;
      clearPoll();
    };
  }, [load, clearPoll]);

  const markComplete = useCallback(async () => {
    setIsCompleting(true);
    try {
      await completeChapter(planId, chapterId);
      await load();
    } finally {
      setIsCompleting(false);
    }
  }, [planId, chapterId, load]);

  const toggleItem = useCallback(
    async (itemId: string) => {
      const previousChapter = state.chapter;
      if (!previousChapter) {
        return;
      }

      const updatedItems = previousChapter.checklistItems.map((item) => {
        if (item._id !== itemId) {
          return item;
        }
        const status: ChecklistItemStatus =
          item.status === 'mastered' ? 'not_started' : 'mastered';
        return { ...item, status };
      });

      setState((prev) =>
        prev.chapter
          ? { ...prev, chapter: { ...prev.chapter, checklistItems: updatedItems } }
          : prev,
      );

      try {
        await toggleChecklistItem(planId, chapterId, itemId);
      } catch {
        setState((prev) => ({ ...prev, chapter: previousChapter }));
        return;
      }

      const allMastered =
        updatedItems.length > 0 && updatedItems.every((item) => item.status === 'mastered');
      if (allMastered && previousChapter.status !== 'completed') {
        await markComplete();
      }
    },
    [planId, chapterId, state.chapter, markComplete],
  );

  return { ...state, isCompleting, reload: load, markComplete, toggleItem };
}
