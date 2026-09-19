import { Body, Controller, Get, Patch } from '@nestjs/common';
import { DeviceId } from '../common/decorators/device-id.decorator.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@DeviceId() deviceId: string) {
    return this.usersService.findOrCreateByDeviceId(deviceId);
  }

  @Patch('me')
  updateMe(@DeviceId() deviceId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateName(deviceId, dto.name);
  }
}
