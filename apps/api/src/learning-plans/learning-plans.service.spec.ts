import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GroqService } from '../groq/groq.service.js';
import { UsersService } from '../users/users.service.js';
import { ChapterStatus, HobbyLevel, LearningPlanStatus } from './enums/index.js';
import { LearningPlansService } from './learning-plans.service.js';
import { LearningPlan } from './schemas/learning-plan.schema.js';

describe('LearningPlansService', () => {
  let service: LearningPlansService;
  let planModel: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };
  let usersService: { findOrCreateByDeviceId: ReturnType<typeof vi.fn> };
  let groqService: {
    generateSyllabus: ReturnType<typeof vi.fn>;
    reviseSyllabus: ReturnType<typeof vi.fn>;
  };

  const userId = new Types.ObjectId();

  beforeEach(async () => {
    planModel = { create: vi.fn(), findOne: vi.fn(), find: vi.fn() };
    usersService = { findOrCreateByDeviceId: vi.fn().mockResolvedValue({ _id: userId }) };
    groqService = {
      generateSyllabus: vi.fn().mockResolvedValue([
        { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
      ]),
      reviseSyllabus: vi.fn().mockResolvedValue([
        { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
        { title: 'Chords', description: 'Learn chords', order: 1, timeEstimateDays: 3 },
      ]),
    };

    const module = await Test.createTestingModule({
      providers: [
        LearningPlansService,
        { provide: getModelToken(LearningPlan.name), useValue: planModel },
        { provide: UsersService, useValue: usersService },
        { provide: GroqService, useValue: groqService },
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
});
