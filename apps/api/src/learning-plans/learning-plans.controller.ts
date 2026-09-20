import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DeviceId } from '../common/decorators/device-id.decorator.js';
import { CreateLearningPlanDto } from './dto/create-learning-plan.dto.js';
import { ReviseChaptersDto } from './dto/revise-chapters.dto.js';
import { UpdateChaptersDto } from './dto/update-chapters.dto.js';
import { LearningPlansService } from './learning-plans.service.js';

@Controller('learning-plans')
export class LearningPlansController {
  constructor(private readonly learningPlansService: LearningPlansService) {}

  @Post()
  create(@DeviceId() deviceId: string, @Body() dto: CreateLearningPlanDto) {
    return this.learningPlansService.create(deviceId, dto);
  }

  @Get('active')
  findAllActive(@DeviceId() deviceId: string) {
    return this.learningPlansService.findAllActive(deviceId);
  }

  @Get(':id')
  findOne(@DeviceId() deviceId: string, @Param('id') id: string) {
    return this.learningPlansService.getForAccess(deviceId, id);
  }

  @Patch(':id/chapters')
  updateChapters(
    @DeviceId() deviceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateChaptersDto,
  ) {
    return this.learningPlansService.updateChapters(deviceId, id, dto.chapters);
  }

  @Patch(':id/revise')
  reviseChapters(
    @DeviceId() deviceId: string,
    @Param('id') id: string,
    @Body() dto: ReviseChaptersDto,
  ) {
    return this.learningPlansService.reviseChapters(deviceId, id, dto.instruction);
  }

  @Post(':id/approve')
  approve(@DeviceId() deviceId: string, @Param('id') id: string) {
    return this.learningPlansService.approve(deviceId, id);
  }

  @Post(':id/chapters/:chapterId/complete')
  completeChapter(
    @DeviceId() deviceId: string,
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.learningPlansService.completeChapter(deviceId, id, chapterId);
  }

  @Post(':id/chapters/:chapterId/items/:itemId/toggle')
  toggleChecklistItem(
    @DeviceId() deviceId: string,
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.learningPlansService.toggleChecklistItem(deviceId, id, chapterId, itemId);
  }

  @Delete(':id')
  remove(@DeviceId() deviceId: string, @Param('id') id: string) {
    return this.learningPlansService.remove(deviceId, id);
  }

  @Get(':id/chapters/:chapterId/checklist')
  getChapterChecklist(
    @DeviceId() deviceId: string,
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.learningPlansService.getChapterChecklist(deviceId, id, chapterId);
  }
}
