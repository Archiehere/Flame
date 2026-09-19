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
});
