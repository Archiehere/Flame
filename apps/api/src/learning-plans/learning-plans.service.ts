import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroqService } from '../groq/groq.service.js';
import { UsersService } from '../users/users.service.js';
import { YoutubeService } from '../youtube/youtube.service.js';
import { CreateLearningPlanDto } from './dto/create-learning-plan.dto.js';
import { ChapterInputDto } from './dto/update-chapters.dto.js';
import {
  ChapterStatus,
  ChecklistItemStatus,
  ContentModality,
  LearningPlanStatus,
} from './enums/index.js';
import { Chapter } from './schemas/chapter.schema.js';
import { ChecklistItem } from './schemas/checklist-item.schema.js';
import { LearningPlan, LearningPlanDocument } from './schemas/learning-plan.schema.js';

export interface ChapterChecklistResult {
  plan: LearningPlanDocument;
  generating: boolean;
}

@Injectable()
export class LearningPlansService {
  private readonly logger = new Logger(LearningPlansService.name);
  // Tracks chapters currently being generated in the background, keyed by
  // "planId:chapterId", so concurrent requests for the same chapter don't
  // each kick off their own duplicate generation.
  private readonly generatingChapters = new Set<string>();

  constructor(
    @InjectModel(LearningPlan.name) private readonly planModel: Model<LearningPlanDocument>,
    private readonly usersService: UsersService,
    private readonly groqService: GroqService,
    private readonly youtubeService: YoutubeService,
  ) {}

  async create(deviceId: string, dto: CreateLearningPlanDto): Promise<LearningPlanDocument> {
    const user = await this.usersService.findOrCreateByDeviceId(deviceId);
    const targetDate = new Date(dto.targetDate);

    const chapters = await this.groqService.generateSyllabus({
      hobby: dto.hobby,
      level: dto.level,
      targetDate,
      notes: dto.hobbyNotes,
    });

    return this.planModel.create({
      userId: user._id,
      hobby: dto.hobby,
      level: dto.level,
      targetDate,
      status: LearningPlanStatus.DRAFT,
      chapters: chapters.map((chapter) => ({ ...chapter, status: ChapterStatus.LOCKED })),
    });
  }

  /**
   * Turns a user's free-text onboarding answer (typos, filler words, and
   * all) into a clean hobby name plus any extra context they volunteered,
   * so "hobby" never ends up as the raw sentence they typed.
   */
  async extractHobby(message: string) {
    return this.groqService.extractHobby(message);
  }

  async findAllActive(deviceId: string): Promise<LearningPlanDocument[]> {
    const user = await this.usersService.findOrCreateByDeviceId(deviceId);
    return this.planModel
      .find({ userId: user._id, status: LearningPlanStatus.ACTIVE })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(deviceId: string, planId: string): Promise<LearningPlanDocument> {
    const user = await this.usersService.findOrCreateByDeviceId(deviceId);
    const plan = await this.planModel.findOne({ _id: planId, userId: user._id }).exec();
    if (!plan) {
      throw new NotFoundException(`Learning plan ${planId} not found`);
    }
    return plan;
  }

  /**
   * Same as findOne, but also records the day's streak activity. Used only
   * by the "open a course" route — findOne itself stays a plain read so it
   * can be reused internally (approve, completeChapter, etc.) without every
   * internal fetch counting as the user "accessing" a course.
   */
  async getForAccess(
    deviceId: string,
    planId: string,
    localDateKey?: string,
  ): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    await this.usersService.recordActivity(deviceId, localDateKey);
    return plan;
  }

  async updateChapters(
    deviceId: string,
    planId: string,
    chapters: ChapterInputDto[],
  ): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    this.assertDraft(plan);

    plan.chapters = chapters.map((chapter) => ({
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      timeEstimateDays: chapter.timeEstimateDays,
      status: ChapterStatus.LOCKED,
      checklistItems: [],
    })) as unknown as Types.DocumentArray<Chapter>;
    return plan.save();
  }

  async reviseChapters(
    deviceId: string,
    planId: string,
    instruction: string,
  ): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    this.assertDraft(plan);

    const revisedChapters = await this.groqService.reviseSyllabus({
      currentChapters: plan.chapters.map(({ title, description, order, timeEstimateDays }) => ({
        title,
        description,
        order,
        timeEstimateDays,
      })),
      instruction,
    });

    plan.chapters = revisedChapters.map((chapter) => ({
      ...chapter,
      status: ChapterStatus.LOCKED,
      checklistItems: [],
    })) as unknown as Types.DocumentArray<Chapter>;
    return plan.save();
  }

  /**
   * Returns the chapter's checklist immediately if it already exists.
   * Otherwise kicks off generation in the background (an LLM call plus
   * video lookups that can take well past a client's fetch timeout) and
   * returns right away with `generating: true` — the caller is expected to
   * poll this endpoint again shortly instead of the request blocking on the
   * full generation.
   */
  async getChapterChecklist(
    deviceId: string,
    planId: string,
    chapterId: string,
  ): Promise<ChapterChecklistResult> {
    const plan = await this.findOne(deviceId, planId);
    const chapter = plan.chapters.id(chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter ${chapterId} not found`);
    }

    if (chapter.checklistItems.length > 0) {
      return { plan, generating: false };
    }

    const key = `${planId}:${chapterId}`;
    if (!this.generatingChapters.has(key)) {
      this.generatingChapters.add(key);
      void this.generateChecklistInBackground(deviceId, planId, chapterId, key);
    }

    return { plan, generating: true };
  }

  private async generateChecklistInBackground(
    deviceId: string,
    planId: string,
    chapterId: string,
    key: string,
  ): Promise<void> {
    try {
      const plan = await this.findOne(deviceId, planId);
      const chapter = plan.chapters.id(chapterId);
      if (!chapter || chapter.checklistItems.length > 0) {
        return;
      }

      const generatedItems = await this.groqService.generateChecklistItems({
        hobby: plan.hobby,
        level: plan.level,
        chapterTitle: chapter.title,
        chapterDescription: chapter.description,
      });

      const items = await Promise.all(
        generatedItems.map(async (item) => {
          const youtubeVideoId =
            item.modality !== 'text' && item.videoSearchQuery
              ? (await this.youtubeService.findBestVideo(item.videoSearchQuery))?.videoId
              : undefined;

          return {
            title: item.title,
            description: item.description,
            modality: item.modality as ContentModality,
            required: item.required,
            order: item.order,
            status: ChecklistItemStatus.NOT_STARTED,
            textContent: item.textContent,
            steps: item.steps,
            youtubeVideoId,
          };
        }),
      );
      chapter.checklistItems = items as unknown as ChecklistItem[];

      await plan.save();
    } catch (error) {
      this.logger.warn(`Background checklist generation failed for ${key}: ${String(error)}`);
    } finally {
      this.generatingChapters.delete(key);
    }
  }

  /**
   * Toggles a single checklist item between mastered and not-started. This
   * is the per-item completion persistence — separate from completeChapter,
   * which marks the whole chapter done regardless of individual item state.
   */
  async toggleChecklistItem(
    deviceId: string,
    planId: string,
    chapterId: string,
    itemId: string,
  ): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    const chapter = plan.chapters.id(chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter ${chapterId} not found`);
    }

    const item = (
      chapter.checklistItems as unknown as Types.DocumentArray<ChecklistItem>
    ).id(itemId);
    if (!item) {
      throw new NotFoundException(`Checklist item ${itemId} not found`);
    }

    item.status =
      item.status === ChecklistItemStatus.MASTERED
        ? ChecklistItemStatus.NOT_STARTED
        : ChecklistItemStatus.MASTERED;

    return plan.save();
  }

  async completeChapter(
    deviceId: string,
    planId: string,
    chapterId: string,
  ): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    const chapter = plan.chapters.id(chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter ${chapterId} not found`);
    }

    chapter.status = ChapterStatus.COMPLETED;

    const index = plan.chapters.indexOf(chapter);
    const nextChapter = plan.chapters[index + 1];
    if (nextChapter) {
      if (nextChapter.status === ChapterStatus.LOCKED) {
        nextChapter.status = ChapterStatus.CURRENT;
      }
    } else {
      plan.status = LearningPlanStatus.COMPLETED;
    }

    return plan.save();
  }

  async remove(deviceId: string, planId: string): Promise<{ deleted: true }> {
    const plan = await this.findOne(deviceId, planId);
    await plan.deleteOne();
    return { deleted: true };
  }

  async approve(deviceId: string, planId: string): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    this.assertDraft(plan);

    plan.status = LearningPlanStatus.ACTIVE;
    const firstChapter = plan.chapters[0];
    if (firstChapter) {
      firstChapter.status = ChapterStatus.CURRENT;
    }
    return plan.save();
  }

  private assertDraft(plan: LearningPlanDocument): void {
    if (plan.status !== LearningPlanStatus.DRAFT) {
      throw new BadRequestException(`Learning plan ${plan.id} is no longer in draft`);
    }
  }
}
