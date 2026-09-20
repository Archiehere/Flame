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
   *
   * "Today" is the client's local calendar day (`localDateKey`, e.g.
   * "2026-09-21"), not the server's. Computing it server-side via
   * `new Date()` would use UTC, which rolls over at the wrong moment for
   * every non-UTC user — someone ahead of UTC (e.g. UTC+5:30) hits their
   * local midnight hours before the server's day actually changes, so a
   * streak check right after midnight would silently still count as
   * "yesterday" from the server's point of view. Falls back to server UTC
   * only if the client didn't send one (older clients).
   */
  async recordActivity(deviceId: string, localDateKey?: string): Promise<UserDocument> {
    const user = await this.findOrCreateByDeviceId(deviceId);
    const todayKey = localDateKey ?? dayKey(new Date());

    if (user.lastActiveDate && dayKey(user.lastActiveDate) === todayKey) {
      return user;
    }

    const yesterdayKey = shiftDayKey(todayKey, -1);
    const wasActiveYesterday =
      user.lastActiveDate !== null && dayKey(user.lastActiveDate) === yesterdayKey;

    user.currentStreak = wasActiveYesterday ? user.currentStreak + 1 : 1;
    user.lastActiveDate = parseDayKey(todayKey);
    return user.save();
  }
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDayKey(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

function shiftDayKey(key: string, days: number): string {
  const date = parseDayKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return dayKey(date);
}
