import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { HobbyLevel } from '../learning-plans/enums/index.js';
import { Syllabus, syllabusSchema } from './syllabus.schema.js';

export interface GenerateSyllabusInput {
  hobby: string;
  level: HobbyLevel;
  targetDate: Date;
}

export interface ReviseSyllabusInput {
  currentChapters: Syllabus['chapters'];
  instruction: string;
}

const SYSTEM_PROMPT = `You are the curriculum planner for Flame, a mobile app that teaches people hobbies entirely within the app.

Rules you must always follow:
- Every lesson happens inside this app. Never suggest the user join a community, find a local class or teacher, watch content on another app, or go anywhere outside Flame.
- Break the hobby into a sequence of chapters, ordered from foundational to advanced, appropriate for the user's stated level and realistic for their target timeframe.
- Respond with strict JSON only, matching this exact shape and nothing else:
{"chapters":[{"title":"string","description":"string","order":0,"timeEstimateDays":1}]}
- "order" starts at 0 and increases by 1 per chapter.
- "timeEstimateDays" is a positive number of days the chapter should take; short chapters can be a single day.
- Do not include markdown, comments, or any text outside the JSON object.`;

const REVISE_SYSTEM_PROMPT = `You are the curriculum planner for Flame, a mobile app that teaches people hobbies entirely within the app.

You will be given the user's current chapter plan and a request describing how they want it changed. Apply the request and return the full revised plan.

Rules you must always follow:
- Every lesson happens inside this app. Never suggest the user join a community, find a local class or teacher, watch content on another app, or go anywhere outside Flame.
- Keep chapters not affected by the request unchanged, unless reordering is needed for consistency.
- Renumber "order" starting at 0 after any additions, removals, or reordering.
- Respond with strict JSON only, matching this exact shape and nothing else:
{"chapters":[{"title":"string","description":"string","order":0,"timeEstimateDays":1}]}
- "timeEstimateDays" is a positive number of days the chapter should take; short chapters can be a single day.
- Do not include markdown, comments, or any text outside the JSON object.`;

@Injectable()
export class GroqService {
  private readonly client: Groq;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Groq({ apiKey: this.configService.get<string>('GROQ_API_KEY') });
    this.model = this.configService.get<string>('GROQ_MODEL') ?? 'openai/gpt-oss-120b';
  }

  async generateSyllabus(input: GenerateSyllabusInput): Promise<Syllabus['chapters']> {
    const userPrompt = this.buildUserPrompt(input);
    const raw = await this.requestJson(SYSTEM_PROMPT, userPrompt);
    return this.parseAndValidate(raw);
  }

  async reviseSyllabus({
    currentChapters,
    instruction,
  }: ReviseSyllabusInput): Promise<Syllabus['chapters']> {
    const userPrompt = [
      `Current plan: ${JSON.stringify({ chapters: currentChapters })}`,
      `User's request: ${instruction}`,
    ].join('\n');
    const raw = await this.requestJson(REVISE_SYSTEM_PROMPT, userPrompt);
    return this.parseAndValidate(raw);
  }

  private buildUserPrompt({ hobby, level, targetDate }: GenerateSyllabusInput): string {
    const daysUntilTarget = Math.max(
      1,
      Math.round((targetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
    );

    return [
      `Hobby: ${hobby}`,
      `Current level: ${level}`,
      `Target: the user wants to reach a good working level in about ${daysUntilTarget} day(s).`,
    ].join('\n');
  }

  private async requestJson(systemPrompt: string, userPrompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new InternalServerErrorException('Groq returned an empty syllabus response');
    }
    return content;
  }

  private parseAndValidate(raw: string): Syllabus['chapters'] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException('Groq returned malformed JSON for the syllabus');
    }

    const result = syllabusSchema.safeParse(parsed);
    if (!result.success) {
      throw new InternalServerErrorException('Groq syllabus did not match the expected shape');
    }

    return result.data.chapters;
  }
}
