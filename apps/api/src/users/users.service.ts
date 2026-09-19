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
}
