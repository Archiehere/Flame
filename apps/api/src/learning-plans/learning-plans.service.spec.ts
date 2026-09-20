import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GroqService } from '../groq/groq.service.js';
import { UsersService } from '../users/users.service.js';
import { YoutubeService } from '../youtube/youtube.service.js';
import {
  ChapterStatus,
  ChecklistItemStatus,
  ContentModality,
  HobbyLevel,
  LearningPlanStatus,
} from './enums/index.js';
import { LearningPlansService } from './learning-plans.service.js';
import { LearningPlan } from './schemas/learning-plan.schema.js';

function withChapterLookup<T extends { _id: string }>(chapters: T[]) {
  return Object.assign(chapters, {
    id: (chapterId: string) => chapters.find((c) => c._id === chapterId) ?? null,
  });
}

function withItemLookup<T extends { _id: string }>(items: T[]) {
  return Object.assign(items, {
    id: (itemId: string) => items.find((i) => i._id === itemId) ?? null,
  });
}

describe('LearningPlansService', () => {
  let service: LearningPlansService;
  let planModel: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };
  let usersService: {
    findOrCreateByDeviceId: ReturnType<typeof vi.fn>;
    recordActivity: ReturnType<typeof vi.fn>;
  };
  let groqService: {
    generateSyllabus: ReturnType<typeof vi.fn>;
    reviseSyllabus: ReturnType<typeof vi.fn>;
    generateChecklistItems: ReturnType<typeof vi.fn>;
  };
  let youtubeService: { findBestVideo: ReturnType<typeof vi.fn> };

  const userId = new Types.ObjectId();

  beforeEach(async () => {
    planModel = { create: vi.fn(), findOne: vi.fn(), find: vi.fn() };
    usersService = {
      findOrCreateByDeviceId: vi.fn().mockResolvedValue({ _id: userId }),
      recordActivity: vi.fn(),
    };
    groqService = {
      generateSyllabus: vi.fn().mockResolvedValue([
        { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
      ]),
      reviseSyllabus: vi.fn().mockResolvedValue([
        { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
        { title: 'Chords', description: 'Learn chords', order: 1, timeEstimateDays: 3 },
      ]),
      generateChecklistItems: vi.fn(),
    };
    youtubeService = { findBestVideo: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        LearningPlansService,
        { provide: getModelToken(LearningPlan.name), useValue: planModel },
        { provide: UsersService, useValue: usersService },
        { provide: GroqService, useValue: groqService },
        { provide: YoutubeService, useValue: youtubeService },
      ],
    }).compile();

    service = module.get(LearningPlansService);
  });

  describe('create', () => {
    it('generates a syllabus and persists a draft plan', async () => {
      planModel.create.mockResolvedValue({ id: 'plan-1' });

      await service.create('device-1', {
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        targetDate: new Date().toISOString(),
      });

      expect(groqService.generateSyllabus).toHaveBeenCalledWith(
        expect.objectContaining({ hobby: 'Guitar', level: HobbyLevel.BEGINNER }),
      );
      expect(planModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          status: LearningPlanStatus.DRAFT,
          chapters: [expect.objectContaining({ title: 'Basics', status: ChapterStatus.LOCKED })],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the plan when owned by the user', async () => {
      const plan = { id: 'plan-1', userId };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.findOne('device-1', 'plan-1');

      expect(result).toBe(plan);
    });

    it('throws NotFoundException when no plan matches', async () => {
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });

      await expect(service.findOne('device-1', 'missing')).rejects.toThrow('not found');
    });
  });

  describe('getForAccess', () => {
    it('returns the plan and records the day as active', async () => {
      const plan = { id: 'plan-1', userId };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.getForAccess('device-1', 'plan-1');

      expect(result).toBe(plan);
      expect(usersService.recordActivity).toHaveBeenCalledWith('device-1');
    });

    it('does not record activity when the plan is not found', async () => {
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });

      await expect(service.getForAccess('device-1', 'missing')).rejects.toThrow('not found');
      expect(usersService.recordActivity).not.toHaveBeenCalled();
    });
  });

  describe('findAllActive', () => {
    it('returns every active plan for the user', async () => {
      const plans = [
        { id: 'plan-2', userId, status: LearningPlanStatus.ACTIVE },
        { id: 'plan-1', userId, status: LearningPlanStatus.ACTIVE },
      ];
      const sort = vi.fn().mockReturnValue({ exec: () => Promise.resolve(plans) });
      planModel.find.mockReturnValue({ sort });

      const result = await service.findAllActive('device-1');

      expect(planModel.find).toHaveBeenCalledWith({
        userId,
        status: LearningPlanStatus.ACTIVE,
      });
      expect(result).toBe(plans);
    });

    it('returns an empty array when there are no active plans', async () => {
      const sort = vi.fn().mockReturnValue({ exec: () => Promise.resolve([]) });
      planModel.find.mockReturnValue({ sort });

      const result = await service.findAllActive('device-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateChapters', () => {
    it('replaces chapters while the plan is a draft', async () => {
      const plan = {
        id: 'plan-1',
        userId,
        status: LearningPlanStatus.DRAFT,
        chapters: [],
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.updateChapters('device-1', 'plan-1', [
        { title: 'New chapter', description: 'desc', order: 0, timeEstimateDays: 1 },
      ]);

      expect(plan.chapters).toEqual([
        expect.objectContaining({ title: 'New chapter', status: ChapterStatus.LOCKED }),
      ]);
      expect(result).toBe(plan);
    });

    it('rejects updates once the plan is no longer a draft', async () => {
      const plan = { id: 'plan-1', userId, status: LearningPlanStatus.ACTIVE, chapters: [] };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await expect(
        service.updateChapters('device-1', 'plan-1', [
          { title: 'New chapter', description: 'desc', order: 0, timeEstimateDays: 1 },
        ]),
      ).rejects.toThrow('no longer in draft');
    });
  });

  describe('reviseChapters', () => {
    it('applies the Groq revision to the draft plan', async () => {
      const plan = {
        id: 'plan-1',
        userId,
        status: LearningPlanStatus.DRAFT,
        chapters: [{ title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 }],
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.reviseChapters('device-1', 'plan-1', 'Add a chapter about chords');

      expect(groqService.reviseSyllabus).toHaveBeenCalledWith({
        currentChapters: [
          { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
        ],
        instruction: 'Add a chapter about chords',
      });
      expect(plan.chapters).toEqual([
        expect.objectContaining({ title: 'Basics', status: ChapterStatus.LOCKED }),
        expect.objectContaining({ title: 'Chords', status: ChapterStatus.LOCKED }),
      ]);
      expect(result).toBe(plan);
    });

    it('rejects revisions once the plan is no longer a draft', async () => {
      const plan = { id: 'plan-1', userId, status: LearningPlanStatus.ACTIVE, chapters: [] };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await expect(
        service.reviseChapters('device-1', 'plan-1', 'Add a chapter'),
      ).rejects.toThrow('no longer in draft');
    });
  });

  describe('getChapterChecklist', () => {
    it('kicks off background generation and returns immediately with generating:true', async () => {
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        description: 'Learn the basics',
        checklistItems: [],
      };
      const plan = {
        id: 'plan-1',
        userId,
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        chapters: withChapterLookup([chapter]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });
      groqService.generateChecklistItems.mockResolvedValue([
        {
          title: 'E minor chord',
          description: 'Learn the shape',
          modality: 'video',
          required: true,
          order: 0,
          videoSearchQuery: 'how to play E minor chord',
        },
      ]);
      youtubeService.findBestVideo.mockResolvedValue({ videoId: 'abc123', title: 'A video' });

      const result = await service.getChapterChecklist('device-1', 'plan-1', 'chapter-1');

      expect(result.generating).toBe(true);
      expect(result.plan).toBe(plan);
      // The response comes back before the background work has persisted anything.
      expect(chapter.checklistItems).toEqual([]);
    });

    it('eventually persists the generated checklist in the background', async () => {
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        description: 'Learn the basics',
        checklistItems: [],
      };
      const plan = {
        id: 'plan-1',
        userId,
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        chapters: withChapterLookup([chapter]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });
      groqService.generateChecklistItems.mockResolvedValue([
        {
          title: 'E minor chord',
          description: 'Learn the shape',
          modality: 'video',
          required: true,
          order: 0,
          videoSearchQuery: 'how to play E minor chord',
        },
        {
          title: 'Chord theory',
          description: 'Why chords work',
          modality: 'text',
          required: false,
          order: 1,
          textContent: 'A chord is...',
        },
        {
          title: 'Sitting posture',
          description: 'How to sit while playing',
          modality: 'text',
          required: true,
          order: 2,
          steps: ['Sit with a straight back.', 'Rest the guitar on your leg.'],
        },
      ]);
      youtubeService.findBestVideo.mockResolvedValue({ videoId: 'abc123', title: 'A video' });

      await service.getChapterChecklist('device-1', 'plan-1', 'chapter-1');

      await vi.waitFor(() => expect(chapter.checklistItems.length).toBe(3));

      expect(groqService.generateChecklistItems).toHaveBeenCalledWith({
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        chapterTitle: 'Basics',
        chapterDescription: 'Learn the basics',
      });
      expect(youtubeService.findBestVideo).toHaveBeenCalledWith('how to play E minor chord');
      expect(chapter.checklistItems).toEqual([
        expect.objectContaining({
          title: 'E minor chord',
          modality: ContentModality.VIDEO,
          status: ChecklistItemStatus.NOT_STARTED,
          youtubeVideoId: 'abc123',
        }),
        expect.objectContaining({
          title: 'Chord theory',
          modality: ContentModality.TEXT,
          textContent: 'A chord is...',
          youtubeVideoId: undefined,
        }),
        expect.objectContaining({
          title: 'Sitting posture',
          modality: ContentModality.TEXT,
          steps: ['Sit with a straight back.', 'Rest the guitar on your leg.'],
          youtubeVideoId: undefined,
        }),
      ]);
      expect(plan.save).toHaveBeenCalled();
    });

    it('does not kick off a second generation while one is already in progress', async () => {
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        description: 'Learn the basics',
        checklistItems: [],
      };
      const plan = {
        id: 'plan-1',
        userId,
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        chapters: withChapterLookup([chapter]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });
      groqService.generateChecklistItems.mockResolvedValue([
        {
          title: 'E minor chord',
          description: 'Learn the shape',
          modality: 'text',
          required: true,
          order: 0,
          textContent: 'Some content',
        },
      ]);

      const [first, second] = await Promise.all([
        service.getChapterChecklist('device-1', 'plan-1', 'chapter-1'),
        service.getChapterChecklist('device-1', 'plan-1', 'chapter-1'),
      ]);

      expect(first.generating).toBe(true);
      expect(second.generating).toBe(true);

      await vi.waitFor(() => expect(chapter.checklistItems.length).toBe(1));

      expect(groqService.generateChecklistItems).toHaveBeenCalledTimes(1);
    });

    it('returns generating:false immediately when checklist items already exist', async () => {
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        description: 'Learn the basics',
        checklistItems: [{ title: 'Existing item' }],
      };
      const plan = {
        id: 'plan-1',
        userId,
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        chapters: withChapterLookup([chapter]),
        save: vi.fn(),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.getChapterChecklist('device-1', 'plan-1', 'chapter-1');

      expect(result.generating).toBe(false);
      expect(result.plan).toBe(plan);
      expect(groqService.generateChecklistItems).not.toHaveBeenCalled();
      expect(plan.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the chapter does not exist', async () => {
      const plan = {
        id: 'plan-1',
        userId,
        chapters: withChapterLookup([]),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await expect(
        service.getChapterChecklist('device-1', 'plan-1', 'missing-chapter'),
      ).rejects.toThrow('not found');
    });
  });

  describe('toggleChecklistItem', () => {
    it('marks a not-started item as mastered', async () => {
      const item = { _id: 'item-1', title: 'Chord theory', status: ChecklistItemStatus.NOT_STARTED };
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        checklistItems: withItemLookup([item]),
      };
      const plan = {
        id: 'plan-1',
        userId,
        chapters: withChapterLookup([chapter]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.toggleChecklistItem(
        'device-1',
        'plan-1',
        'chapter-1',
        'item-1',
      );

      expect(item.status).toBe(ChecklistItemStatus.MASTERED);
      expect(plan.save).toHaveBeenCalled();
      expect(result).toBe(plan);
    });

    it('toggles a mastered item back to not-started', async () => {
      const item = { _id: 'item-1', title: 'Chord theory', status: ChecklistItemStatus.MASTERED };
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        checklistItems: withItemLookup([item]),
      };
      const plan = {
        id: 'plan-1',
        userId,
        chapters: withChapterLookup([chapter]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await service.toggleChecklistItem('device-1', 'plan-1', 'chapter-1', 'item-1');

      expect(item.status).toBe(ChecklistItemStatus.NOT_STARTED);
    });

    it('throws NotFoundException when the chapter does not exist', async () => {
      const plan = {
        id: 'plan-1',
        userId,
        chapters: withChapterLookup([]),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await expect(
        service.toggleChecklistItem('device-1', 'plan-1', 'missing-chapter', 'item-1'),
      ).rejects.toThrow('not found');
    });

    it('throws NotFoundException when the checklist item does not exist', async () => {
      const chapter = {
        _id: 'chapter-1',
        title: 'Basics',
        checklistItems: withItemLookup([]),
      };
      const plan = {
        id: 'plan-1',
        userId,
        chapters: withChapterLookup([chapter]),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await expect(
        service.toggleChecklistItem('device-1', 'plan-1', 'chapter-1', 'missing-item'),
      ).rejects.toThrow('not found');
    });
  });

  describe('completeChapter', () => {
    it('marks the chapter completed and unlocks the next one', async () => {
      const chapter1 = { _id: 'chapter-1', title: 'Basics', status: ChapterStatus.CURRENT };
      const chapter2 = { _id: 'chapter-2', title: 'Chords', status: ChapterStatus.LOCKED };
      const plan = {
        id: 'plan-1',
        userId,
        status: LearningPlanStatus.ACTIVE,
        chapters: withChapterLookup([chapter1, chapter2]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.completeChapter('device-1', 'plan-1', 'chapter-1');

      expect(chapter1.status).toBe(ChapterStatus.COMPLETED);
      expect(chapter2.status).toBe(ChapterStatus.CURRENT);
      expect(plan.status).toBe(LearningPlanStatus.ACTIVE);
      expect(result).toBe(plan);
    });

    it('completes the plan when the last chapter is finished', async () => {
      const chapter1 = { _id: 'chapter-1', title: 'Basics', status: ChapterStatus.CURRENT };
      const plan = {
        id: 'plan-1',
        userId,
        status: LearningPlanStatus.ACTIVE,
        chapters: withChapterLookup([chapter1]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.completeChapter('device-1', 'plan-1', 'chapter-1');

      expect(chapter1.status).toBe(ChapterStatus.COMPLETED);
      expect(plan.status).toBe(LearningPlanStatus.COMPLETED);
      expect(result).toBe(plan);
    });

    it('does not relock an already-unlocked next chapter', async () => {
      const chapter1 = { _id: 'chapter-1', title: 'Basics', status: ChapterStatus.CURRENT };
      const chapter2 = { _id: 'chapter-2', title: 'Chords', status: ChapterStatus.COMPLETED };
      const plan = {
        id: 'plan-1',
        userId,
        status: LearningPlanStatus.ACTIVE,
        chapters: withChapterLookup([chapter1, chapter2]),
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await service.completeChapter('device-1', 'plan-1', 'chapter-1');

      expect(chapter2.status).toBe(ChapterStatus.COMPLETED);
    });

    it('throws NotFoundException when the chapter does not exist', async () => {
      const plan = {
        id: 'plan-1',
        userId,
        chapters: withChapterLookup([]),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      await expect(
        service.completeChapter('device-1', 'plan-1', 'missing-chapter'),
      ).rejects.toThrow('not found');
    });
  });

  describe('approve', () => {
    it('activates the plan and unlocks the first chapter', async () => {
      const plan = {
        id: 'plan-1',
        userId,
        status: LearningPlanStatus.DRAFT,
        chapters: [{ title: 'Basics', status: ChapterStatus.LOCKED }],
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.approve('device-1', 'plan-1');

      expect(plan.status).toBe(LearningPlanStatus.ACTIVE);
      expect(plan.chapters[0]?.status).toBe(ChapterStatus.CURRENT);
      expect(result).toBe(plan);
    });
  });

  describe('remove', () => {
    it('deletes the plan when owned by the user', async () => {
      const plan = { id: 'plan-1', userId, deleteOne: vi.fn().mockResolvedValue(undefined) };
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(plan) });

      const result = await service.remove('device-1', 'plan-1');

      expect(plan.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });

    it('throws NotFoundException when no plan matches', async () => {
      planModel.findOne.mockReturnValue({ exec: () => Promise.resolve(null) });

      await expect(service.remove('device-1', 'missing')).rejects.toThrow('not found');
    });
  });
});
