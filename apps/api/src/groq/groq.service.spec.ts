import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HobbyLevel } from '../learning-plans/enums/index.js';
import { GroqService } from './groq.service.js';

const createMock = vi.hoisted(() => vi.fn());

vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(function GroqMock(this: unknown) {
    return { chat: { completions: { create: createMock } } };
  }),
}));

function completionWith(content: string) {
  return { choices: [{ message: { content } }] };
}

describe('GroqService', () => {
  let service: GroqService;

  beforeEach(async () => {
    createMock.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        GroqService,
        {
          provide: ConfigService,
          useValue: { get: () => undefined },
        },
      ],
    }).compile();

    service = module.get(GroqService);
  });

  it('returns parsed chapters for a well-formed response', async () => {
    createMock.mockResolvedValue(
      completionWith(
        JSON.stringify({
          chapters: [
            { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
          ],
        }),
      ),
    );

    const chapters = await service.generateSyllabus({
      hobby: 'Guitar',
      level: HobbyLevel.BEGINNER,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    expect(chapters).toHaveLength(1);
    expect(chapters[0]?.title).toBe('Basics');
  });

  it('throws when Groq returns malformed JSON', async () => {
    createMock.mockResolvedValue(completionWith('not json'));

    await expect(
      service.generateSyllabus({
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        targetDate: new Date(),
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('throws when the JSON does not match the syllabus schema', async () => {
    createMock.mockResolvedValue(completionWith(JSON.stringify({ chapters: [] })));

    await expect(
      service.generateSyllabus({
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        targetDate: new Date(),
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('throws when Groq returns an empty message', async () => {
    createMock.mockResolvedValue({ choices: [{ message: {} }] });

    await expect(
      service.generateSyllabus({
        hobby: 'Guitar',
        level: HobbyLevel.BEGINNER,
        targetDate: new Date(),
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('reviseSyllabus', () => {
    it('returns the revised chapters', async () => {
      createMock.mockResolvedValue(
        completionWith(
          JSON.stringify({
            chapters: [
              { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
              { title: 'Chords', description: 'Learn chords', order: 1, timeEstimateDays: 3 },
            ],
          }),
        ),
      );

      const chapters = await service.reviseSyllabus({
        currentChapters: [
          { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
        ],
        instruction: 'Add a chapter about chords',
      });

      expect(chapters).toHaveLength(2);
      expect(chapters[1]?.title).toBe('Chords');
    });

    it('throws when Groq returns malformed JSON', async () => {
      createMock.mockResolvedValue(completionWith('not json'));

      await expect(
        service.reviseSyllabus({ currentChapters: [], instruction: 'remove everything' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('generateChecklistItems', () => {
    const input = {
      hobby: 'Guitar',
      level: HobbyLevel.BEGINNER,
      chapterTitle: 'Basic Chords',
      chapterDescription: 'Learn open chords',
    };

    it('returns parsed checklist items for a well-formed response', async () => {
      createMock.mockResolvedValue(
        completionWith(
          JSON.stringify({
            items: [
              {
                title: 'E minor chord',
                description: 'Learn the E minor shape',
                modality: 'video',
                required: true,
                order: 0,
                videoSearchQuery: 'how to play E minor chord guitar beginner',
              },
              {
                title: 'Chord theory basics',
                description: 'Why chords are built the way they are',
                modality: 'text',
                required: false,
                order: 1,
                textContent: 'A chord is built from stacked thirds...',
              },
            ],
          }),
        ),
      );

      const items = await service.generateChecklistItems(input);

      expect(items).toHaveLength(2);
      expect(items[0]?.modality).toBe('video');
      expect(items[1]?.textContent).toContain('stacked thirds');
    });

    it('accepts a step-structured text item using the steps field', async () => {
      createMock.mockResolvedValue(
        completionWith(
          JSON.stringify({
            items: [
              {
                title: 'Sitting posture',
                description: 'How to sit while playing',
                modality: 'text',
                required: true,
                order: 0,
                steps: [
                  'Sit or stand with a straight back.',
                  'Place the guitar body against your torso.',
                  'Rest your fretting hand thumb behind the neck.',
                ],
              },
            ],
          }),
        ),
      );

      const items = await service.generateChecklistItems(input);

      expect(items).toHaveLength(1);
      expect(items[0]?.steps).toHaveLength(3);
      expect(items[0]?.textContent).toBeUndefined();
    });

    it('throws when a video item is missing videoSearchQuery', async () => {
      createMock.mockResolvedValue(
        completionWith(
          JSON.stringify({
            items: [
              {
                title: 'E minor chord',
                description: 'Learn the E minor shape',
                modality: 'video',
                required: true,
                order: 0,
              },
            ],
          }),
        ),
      );

      await expect(service.generateChecklistItems(input)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws when Groq returns malformed JSON', async () => {
      createMock.mockResolvedValue(completionWith('not json'));

      await expect(service.generateChecklistItems(input)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
