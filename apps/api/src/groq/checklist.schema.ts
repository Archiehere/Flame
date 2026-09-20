import { z } from 'zod';

export const checklistItemSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    modality: z.enum(['text', 'video', 'both']),
    required: z.boolean(),
    order: z.number().int().nonnegative(),
    textContent: z.string().min(1).optional(),
    videoSearchQuery: z.string().min(1).optional(),
  })
  .refine((item) => item.modality === 'video' || !!item.textContent, {
    message: 'textContent is required for text/both modality items',
  })
  .refine((item) => item.modality === 'text' || !!item.videoSearchQuery, {
    message: 'videoSearchQuery is required for video/both modality items',
  });

export const checklistSchema = z.object({
  items: z.array(checklistItemSchema).min(1),
});

export type ChecklistItemGen = z.infer<typeof checklistItemSchema>;
export type Checklist = z.infer<typeof checklistSchema>;
