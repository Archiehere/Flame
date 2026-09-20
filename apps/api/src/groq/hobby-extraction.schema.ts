import { z } from 'zod';

export const hobbyExtractionSchema = z.object({
  hobby: z.string().min(1),
  notes: z.string().min(1).optional(),
});

export type HobbyExtraction = z.infer<typeof hobbyExtractionSchema>;
