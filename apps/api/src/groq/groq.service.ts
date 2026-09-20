import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ZodType } from 'zod';
import { HobbyLevel } from '../learning-plans/enums/index.js';
import { ChecklistItemGen, checklistSchema } from './checklist.schema.js';
import { HobbyExtraction, hobbyExtractionSchema } from './hobby-extraction.schema.js';
import { Syllabus, syllabusSchema } from './syllabus.schema.js';

export interface GenerateSyllabusInput {
  hobby: string;
  level: HobbyLevel;
  targetDate: Date;
  notes?: string;
}

export interface ReviseSyllabusInput {
  currentChapters: Syllabus['chapters'];
  instruction: string;
}

export interface GenerateChecklistInput {
  hobby: string;
  level: HobbyLevel;
  chapterTitle: string;
  chapterDescription: string;
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

const CHECKLIST_SYSTEM_PROMPT = `You are the lesson designer for Flame, a mobile app that teaches people hobbies entirely within the app.

You will be given one chapter from a hobby curriculum. Break it into a checklist of individual techniques or skills the user can track progress against.

Rules you must always follow:
- Every lesson happens inside this app. Never suggest the user join a community, find a local class or teacher, watch content on another app, or go anywhere outside Flame.
- For each item, choose the modality that best teaches that specific skill: "text" for conceptual/reference material, "video" for physical/visual technique, or "both" when seeing it demonstrated AND having written reference notes both help.
- When modality is "text" or "both", write the actual lesson content directly — this is what the user reads in-app, not a placeholder or summary of what they should look up elsewhere. Use exactly one of these two fields, whichever fits the content better:
  - "steps": when the content is a sequence of ordered actions the user performs one after another (e.g. a setup procedure, a technique broken into motions, a practice routine). Each array entry is ONE self-contained step, written as its own sentence(s) — never number them yourself and never put multiple steps in one string.
  - "textContent": when the content is conceptual/reference explanation that isn't a step-by-step procedure (e.g. music theory, terminology, background knowledge).
- When modality is "video" or "both", write a specific, well-formed YouTube search query in "videoSearchQuery" that would surface a good instructional video teaching exactly this skill.
- Mark foundational, prerequisite items as "required": true. Mark everything else "required": false — these are safe for the user to skip.
- Respond with strict JSON only, matching this exact shape and nothing else:
{"items":[{"title":"string","description":"string","modality":"text"|"video"|"both","required":true,"order":0,"textContent":"string (use for prose content; omit if using steps or if modality is video)","steps":["string", "string"] ,"videoSearchQuery":"string (omit if modality is text)"}]}
- Never populate both "textContent" and "steps" on the same item.
- "order" starts at 0 and increases by 1 per item.
- Do not include markdown, comments, or any text outside the JSON object.`;

const HOBBY_EXTRACTION_SYSTEM_PROMPT = `You extract a clean hobby name from a user's free-text message in a hobby-learning app's onboarding chat. Users often answer in full sentences and make spelling mistakes.

Rules you must always follow:
- Correct obvious spelling/typing mistakes.
- Return the hobby as a short, properly capitalized noun phrase (e.g. "Skating", "Watercolor Painting", "Guitar") — never the user's full sentence.
- If the message includes extra context beyond just naming the hobby — a specific style, equipment, goal, or constraint (e.g. "I want to learn skateboarding, not rollerblading" or "focus on jazz chords, I already know basic guitar") — capture that briefly in "notes". Omit "notes" entirely if the message is just the hobby name with no extra detail.
- Respond with strict JSON only, matching this exact shape and nothing else:
{"hobby":"string","notes":"string (omit if no extra context was given)"}
- Do not include markdown, comments, or any text outside the JSON object.`;

@Injectable()
export class GroqService {
  private readonly client: Groq;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Groq({ apiKey: this.configService.get<string>('GROQ_API_KEY') });
    this.model = this.configService.get<string>('GROQ_MODEL') ?? 'openai/gpt-oss-20b';
  }

  async generateSyllabus(input: GenerateSyllabusInput): Promise<Syllabus['chapters']> {
    const userPrompt = this.buildUserPrompt(input);
    const raw = await this.requestJson(SYSTEM_PROMPT, userPrompt);
    return this.parseAndValidate(raw, syllabusSchema).chapters;
  }

  /**
   * Cleans up the user's free-text onboarding answer into a proper hobby
   * name (fixing typos, stripping filler like "let's go with") and pulls
   * out any extra context they volunteered, which callers can feed into
   * generateSyllabus's "notes" for a more tailored curriculum.
   */
  async extractHobby(message: string): Promise<HobbyExtraction> {
    const raw = await this.requestJson(
      HOBBY_EXTRACTION_SYSTEM_PROMPT,
      `User's message: ${message}`,
    );
    return this.parseAndValidate(raw, hobbyExtractionSchema);
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
    return this.parseAndValidate(raw, syllabusSchema).chapters;
  }

  async generateChecklistItems(input: GenerateChecklistInput): Promise<ChecklistItemGen[]> {
    const userPrompt = [
      `Hobby: ${input.hobby}`,
      `Current level: ${input.level}`,
      `Chapter: ${input.chapterTitle}`,
      `Chapter description: ${input.chapterDescription}`,
    ].join('\n');
    const raw = await this.requestJson(CHECKLIST_SYSTEM_PROMPT, userPrompt);
    return this.parseAndValidate(raw, checklistSchema).items;
  }

  private buildUserPrompt({ hobby, level, targetDate, notes }: GenerateSyllabusInput): string {
    const daysUntilTarget = Math.max(
      1,
      Math.round((targetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
    );

    const lines = [
      `Hobby: ${hobby}`,
      `Current level: ${level}`,
      `Target: the user wants to reach a good working level in about ${daysUntilTarget} day(s).`,
    ];
    if (notes) {
      lines.push(`Additional context from the user: ${notes}`);
    }
    return lines.join('\n');
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
      throw new InternalServerErrorException('Groq returned an empty response');
    }
    return content;
  }

  private parseAndValidate<T>(raw: string, schema: ZodType<T>): T {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException('Groq returned malformed JSON');
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new InternalServerErrorException('Groq response did not match the expected shape');
    }

    return result.data;
  }
}
