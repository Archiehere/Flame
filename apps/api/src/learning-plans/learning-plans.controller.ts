import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Get(':id')
  findOne(@DeviceId() deviceId: string, @Param('id') id: string) {
    return this.learningPlansService.findOne(deviceId, id);
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
}
