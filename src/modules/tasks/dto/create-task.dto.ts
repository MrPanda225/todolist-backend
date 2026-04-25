import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title:             z.string().min(1).max(255),
  description:       z.string().max(2000).optional(),
  priorityId:        z.string().uuid(),
  categoryId:        z.string().uuid().optional(),
  recurrenceRuleId:  z.string().uuid().optional(),
  dueDate:           z.coerce.date().optional(),
  estimatedDuration: z.number().int().min(1).max(1440).optional(),
  xpReward:          z.number().int().min(1).max(1000).default(10),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;