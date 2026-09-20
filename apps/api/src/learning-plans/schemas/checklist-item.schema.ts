import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChecklistItemStatus, ContentModality } from '../enums/index.js';

@Schema({ _id: true })
export class ChecklistItem {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, required: true, enum: Object.values(ContentModality) })
  modality!: ContentModality;

  @Prop({ required: true })
  required!: boolean;

  @Prop({ required: true, default: 0 })
  order!: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ChecklistItemStatus),
    default: ChecklistItemStatus.NOT_STARTED,
  })
  status!: ChecklistItemStatus;

  @Prop()
  textContent?: string;

  @Prop({ type: [String] })
  steps?: string[];

  @Prop()
  youtubeVideoId?: string;
}

export const ChecklistItemSchema = SchemaFactory.createForClass(ChecklistItem);
