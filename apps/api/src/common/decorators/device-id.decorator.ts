import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export function extractDeviceId(ctx: ExecutionContext): string {
  const request = ctx.switchToHttp().getRequest<Request>();
  const deviceId = request.headers['x-device-id'];

  if (typeof deviceId !== 'string' || deviceId.trim().length === 0) {
    throw new BadRequestException('x-device-id header is required');
  }

  return deviceId;
}

export const DeviceId = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  extractDeviceId(ctx),
);
