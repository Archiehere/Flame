import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroqModule } from '../groq/groq.module.js';
import { UsersModule } from '../users/users.module.js';
import { YoutubeModule } from '../youtube/youtube.module.js';
import { LearningPlansController } from './learning-plans.controller.js';
import { LearningPlansService } from './learning-plans.service.js';
import { LearningPlan, LearningPlanSchema } from './schemas/learning-plan.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LearningPlan.name, schema: LearningPlanSchema }]),
    UsersModule,
    GroqModule,
    YoutubeModule,
  ],
  controllers: [LearningPlansController],
  providers: [LearningPlansService],
})
export class LearningPlansModule {}
