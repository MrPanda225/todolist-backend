import { z } from 'zod';

const TimeBlockBaseSchema = z.object({
  title:            z.string().min(1).max(255),
  startTime:        z.coerce.date(),
  endTime:          z.coerce.date(),
  color:            z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isRecurring:      z.boolean().default(false),
  recurrenceRuleId: z.string().uuid().optional(),
});

export const CreateTimeBlockSchema = TimeBlockBaseSchema.refine(
  data => data.endTime > data.startTime,
  { message: 'endTime must be after startTime', path: ['endTime'] },
);

export const UpdateTimeBlockSchema = TimeBlockBaseSchema.partial().refine(
  data => {
    if (data.startTime && data.endTime) return data.endTime > data.startTime;
    return true;
  },
  { message: 'endTime must be after startTime', path: ['endTime'] },
);

export type CreateTimeBlockDto = z.infer<typeof CreateTimeBlockSchema>;
export type UpdateTimeBlockDto = z.infer<typeof UpdateTimeBlockSchema>;