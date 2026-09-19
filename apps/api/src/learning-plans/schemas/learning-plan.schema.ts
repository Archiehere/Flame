import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HobbyLevel, LearningPlanStatus } from '../enums/index.js';
import { Chapter, ChapterSchema } from './chapter.schema.js';

export type LearningPlanDocument = HydratedDocument<LearningPlan>;

@Schema({ timestamps: true })
export class LearningPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  hobby!: string;

  @Prop({ type: String, required: true, enum: Object.values(HobbyLevel) })
  level!: HobbyLevel;

  @Prop({ required: true })
  targetDate!: Date;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(LearningPlanStatus),
    default: LearningPlanStatus.DRAFT,
  })
  status!: LearningPlanStatus;

  @Prop({ type: [ChapterSchema], default: [] })
  chapters!: Chapter[];
}

export const LearningPlanSchema = SchemaFactory.createForClass(LearningPlan);
