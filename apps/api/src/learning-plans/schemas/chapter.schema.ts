import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChapterStatus } from '../enums/index.js';
import { ChecklistItem, ChecklistItemSchema } from './checklist-item.schema.js';

@Schema({ _id: true })
export class Chapter {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, default: 0 })
  order!: number;

  @Prop({ required: true })
  timeEstimateDays!: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ChapterStatus),
    default: ChapterStatus.LOCKED,
  })
  status!: ChapterStatus;

  @Prop({ type: [ChecklistItemSchema], default: [] })
  checklistItems!: ChecklistItem[];
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
