import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YoutubeService } from './youtube.service.js';

function jsonResponse(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) };
}

describe('YoutubeService', () => {
  let service: YoutubeService;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YoutubeService,
        { provide: ConfigService, useValue: { get: () => 'fake-api-key' } },
      ],
    }).compile();

    service = module.get(YoutubeService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns null when no api key is configured', async () => {
    const module = await Test.createTestingModule({
      providers: [YoutubeService, { provide: ConfigService, useValue: { get: () => undefined } }],
    }).compile();
    const noKeyService = module.get(YoutubeService);

    const result = await noKeyService.findBestVideo('guitar basics');

    expect(result).toBeNull();
  });

  it('returns null when search finds no candidates', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ items: [] }));

    const result = await service.findBestVideo('an extremely obscure query');

    expect(result).toBeNull();
  });

  it('picks the video with the best score among candidates', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [{ id: { videoId: 'short-low-views' } }, { id: { videoId: 'ideal-video' } }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: 'short-low-views',
              snippet: { title: 'A 10 second clip' },
              contentDetails: { duration: 'PT10S' },
              statistics: { viewCount: '5' },
              status: { embeddable: true },
            },
            {
              id: 'ideal-video',
              snippet: { title: 'A proper 5 minute lesson' },
              contentDetails: { duration: 'PT5M' },
              statistics: { viewCount: '100000' },
              status: { embeddable: true },
            },
          ],
        }),
      );

    const result = await service.findBestVideo('guitar basics');

    expect(result).toEqual({ videoId: 'ideal-video', title: 'A proper 5 minute lesson' });
  });

  it('excludes videos that are not embeddable', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [{ id: { videoId: 'not-embeddable' } }, { id: { videoId: 'embeddable' } }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: 'not-embeddable',
              snippet: { title: 'Owner blocked embedding' },
              contentDetails: { duration: 'PT5M' },
              statistics: { viewCount: '1000000' },
              status: { embeddable: false },
            },
            {
              id: 'embeddable',
              snippet: { title: 'A proper lesson' },
              contentDetails: { duration: 'PT5M' },
              statistics: { viewCount: '100' },
              status: { embeddable: true },
            },
          ],
        }),
      );

    const result = await service.findBestVideo('guitar basics');

    expect(result).toEqual({ videoId: 'embeddable', title: 'A proper lesson' });
  });

  it('returns null when the search request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({}, false));

    const result = await service.findBestVideo('guitar basics');

    expect(result).toBeNull();
  });
});
