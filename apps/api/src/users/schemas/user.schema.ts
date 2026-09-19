import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  deviceId!: string;

  @Prop({ type: String, default: null })
  name!: string | null;

  @Prop({ default: 0 })
  currentStreak!: number;

  @Prop({ type: Date, default: null })
  lastActiveDate!: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
