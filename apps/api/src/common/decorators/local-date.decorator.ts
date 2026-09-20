import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function extractLocalDate(ctx: ExecutionContext): string | undefined {
  const request = ctx.switchToHttp().getRequest<Request>();
  const localDate = request.headers['x-local-date'];

  if (typeof localDate === 'string' && DATE_KEY_PATTERN.test(localDate)) {
    return localDate;
  }
  return undefined;
}

export const LocalDate = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  extractLocalDate(ctx),
);
