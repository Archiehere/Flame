import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let findOne: ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>>;
  let create: ReturnType<typeof vi.fn<(...args: unknown[]) => unknown>>;

  beforeEach(async () => {
    findOne = vi.fn();
    create = vi.fn();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: (...args: unknown[]) => ({ exec: () => findOne(...args) }),
            create: (...args: unknown[]) => create(...args),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('returns the existing user when the device id is known', async () => {
    const existing = { deviceId: 'abc' };
    findOne.mockResolvedValue(existing);

    const result = await service.findOrCreateByDeviceId('abc');

    expect(result).toBe(existing);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a new user when the device id is unknown', async () => {
    findOne.mockResolvedValue(null);
    const created = { deviceId: 'new-device' };
    create.mockResolvedValue(created);

    const result = await service.findOrCreateByDeviceId('new-device');

    expect(create).toHaveBeenCalledWith({ deviceId: 'new-device' });
    expect(result).toBe(created);
  });

  describe('updateName', () => {
    it('sets the name on the existing user and saves it', async () => {
      const save = vi.fn().mockImplementation(function (this: unknown) {
        return Promise.resolve(this);
      });
      const existing = { deviceId: 'abc', name: null, save };
      findOne.mockResolvedValue(existing);

      const result = await service.updateName('abc', 'Ada');

      expect(existing.name).toBe('Ada');
      expect(save).toHaveBeenCalled();
      expect(result).toBe(existing);
    });
  });

  describe('recordActivity', () => {
    function userWithLastActive(lastActiveDate: Date | null, currentStreak = 0) {
      return {
        deviceId: 'abc',
        currentStreak,
        lastActiveDate,
        save: vi.fn().mockImplementation(function (this: unknown) {
          return Promise.resolve(this);
        }),
      };
    }

    it('starts a streak of 1 on first-ever activity', async () => {
      const user = userWithLastActive(null, 0);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc');

      expect(result.currentStreak).toBe(1);
      expect(result.lastActiveDate).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
    });

    it('increments the streak when the user was also active yesterday', async () => {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const user = userWithLastActive(yesterday, 4);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc');

      expect(result.currentStreak).toBe(5);
    });

    it('resets the streak to 1 when there is a gap since the last activity', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);
      const user = userWithLastActive(threeDaysAgo, 10);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc');

      expect(result.currentStreak).toBe(1);
    });

    it('is a no-op when activity was already recorded today', async () => {
      const today = new Date();
      const user = userWithLastActive(today, 7);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc');

      expect(result.currentStreak).toBe(7);
      expect(user.save).not.toHaveBeenCalled();
    });

    it('increments using the client-provided local date, independent of server UTC time', async () => {
      const user = userWithLastActive(new Date('2026-09-20T00:00:00.000Z'), 3);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc', '2026-09-21');

      expect(result.currentStreak).toBe(4);
    });

    it('is a no-op when the client-provided local date matches the stored last-active day', async () => {
      const user = userWithLastActive(new Date('2026-09-21T00:00:00.000Z'), 5);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc', '2026-09-21');

      expect(result.currentStreak).toBe(5);
      expect(user.save).not.toHaveBeenCalled();
    });

    it('resets the streak when the client-provided local date shows a gap', async () => {
      const user = userWithLastActive(new Date('2026-09-18T00:00:00.000Z'), 9);
      findOne.mockResolvedValue(user);

      const result = await service.recordActivity('abc', '2026-09-21');

      expect(result.currentStreak).toBe(1);
    });
  });
});
