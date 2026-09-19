import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface YoutubeVideo {
  videoId: string;
  title: string;
}

interface SearchApiItem {
  id: { videoId: string };
}

interface VideoApiItem {
  id: string;
  snippet: { title: string };
  contentDetails: { duration: string };
  statistics: { viewCount?: string };
}

const IDEAL_DURATION_MIN_SECONDS = 90;
const IDEAL_DURATION_MAX_SECONDS = 20 * 60;

function parseIsoDurationToSeconds(duration: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) {
    return 0;
  }
  const [, hours, minutes, seconds] = match;
  return (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
}

function scoreVideo(durationSeconds: number, viewCount: number): number {
  const durationScore =
    durationSeconds >= IDEAL_DURATION_MIN_SECONDS && durationSeconds <= IDEAL_DURATION_MAX_SECONDS
      ? 1
      : 0.3;
  const viewScore = Math.log10(viewCount + 1);
  return durationScore * viewScore;
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
  }

  async findBestVideo(query: string): Promise<YoutubeVideo | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const candidateIds = await this.search(query);
      if (candidateIds.length === 0) {
        return null;
      }
      return await this.pickBest(candidateIds);
    } catch (error) {
      this.logger.warn(`YouTube lookup failed for "${query}": ${(error as Error).message}`);
      return null;
    }
  }

  private async search(query: string): Promise<string[]> {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '8');
    url.searchParams.set('safeSearch', 'strict');
    url.searchParams.set('q', query);
    url.searchParams.set('key', this.apiKey ?? '');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube search failed with status ${response.status}`);
    }
    const body = (await response.json()) as { items?: SearchApiItem[] };
    return (body.items ?? []).map((item) => item.id.videoId).filter(Boolean);
  }

  private async pickBest(videoIds: string[]): Promise<YoutubeVideo | null> {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'contentDetails,statistics,snippet');
    url.searchParams.set('id', videoIds.join(','));
    url.searchParams.set('key', this.apiKey ?? '');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube videos lookup failed with status ${response.status}`);
    }
    const body = (await response.json()) as { items?: VideoApiItem[] };
    const items = body.items ?? [];
    if (items.length === 0) {
      return null;
    }

    const scored = items.map((item) => {
      const durationSeconds = parseIsoDurationToSeconds(item.contentDetails.duration);
      const viewCount = Number(item.statistics.viewCount ?? 0);
      return {
        videoId: item.id,
        title: item.snippet.title,
        score: scoreVideo(durationSeconds, viewCount),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    return best ? { videoId: best.videoId, title: best.title } : null;
  }
}
