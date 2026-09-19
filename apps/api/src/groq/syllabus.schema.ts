import { z } from 'zod';

export const syllabusChapterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().nonnegative(),
  timeEstimateDays: z.number().positive(),
});

export const syllabusSchema = z.object({
  chapters: z.array(syllabusChapterSchema).min(1),
});

export type SyllabusChapter = z.infer<typeof syllabusChapterSchema>;
export type Syllabus = z.infer<typeof syllabusSchema>;
