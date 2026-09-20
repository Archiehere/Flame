import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findOrCreateByDeviceId(deviceId: string): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ deviceId }).exec();
    if (existing) {
      return existing;
    }
    return this.userModel.create({ deviceId });
  }

  async updateName(deviceId: string, name: string): Promise<UserDocument> {
    const user = await this.findOrCreateByDeviceId(deviceId);
    user.name = name;
    return user.save();
  }

  /**
   * Records that the user was active today (currently triggered by opening
   * a course) and updates their streak: +1 if they were also active
   * yesterday, reset to 1 if there's a gap (or this is their first-ever
   * activity), and a no-op if they've already been recorded today.
   */
  async recordActivity(deviceId: string): Promise<UserDocument> {
    const user = await this.findOrCreateByDeviceId(deviceId);
    const today = new Date();
    const todayKey = dayKey(today);

    if (user.lastActiveDate && dayKey(user.lastActiveDate) === todayKey) {
      return user;
    }

    const yesterdayKey = dayKey(new Date(today.getTime() - 24 * 60 * 60 * 1000));
    const wasActiveYesterday = user.lastActiveDate !== null && dayKey(user.lastActiveDate) === yesterdayKey;

    user.currentStreak = wasActiveYesterday ? user.currentStreak + 1 : 1;
    user.lastActiveDate = today;
    return user.save();
  }
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
