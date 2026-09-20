import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class LearningPlansService {
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

  async getChapterChecklist(
    deviceId: string,
    planId: string,
    chapterId: string,
  ): Promise<LearningPlanDocument> {
    const plan = await this.findOne(deviceId, planId);
    const chapter = plan.chapters.id(chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter ${chapterId} not found`);
    }

    if (chapter.checklistItems.length === 0) {
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
            youtubeVideoId,
          };
        }),
      );
      chapter.checklistItems = items as unknown as ChecklistItem[];

      await plan.save();
    }

    return plan;
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
