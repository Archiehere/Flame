import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { extractDeviceId } from './device-id.decorator.js';

function contextWithHeaders(headers: Record<string, string | undefined>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('extractDeviceId', () => {
  it('returns the header value when present', () => {
    const ctx = contextWithHeaders({ 'x-device-id': 'device-123' });
    expect(extractDeviceId(ctx)).toBe('device-123');
  });

  it('throws when the header is missing', () => {
    const ctx = contextWithHeaders({});
    expect(() => extractDeviceId(ctx)).toThrow(BadRequestException);
  });

  it('throws when the header is blank', () => {
    const ctx = contextWithHeaders({ 'x-device-id': '   ' });
    expect(() => extractDeviceId(ctx)).toThrow(BadRequestException);
  });
});
