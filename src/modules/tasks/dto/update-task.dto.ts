import { z } from 'zod';
import { TaskStatus } from '../../../generated/prisma';

export const UpdateTaskSchema = z.object({
  title:             z.string().min(1).max(255).optional(),
  description:       z.string().max(2000).optional(),
  priorityId:        z.string().uuid().optional(),
  categoryId:        z.string().uuid().optional(),
  status:            z.nativeEnum(TaskStatus).optional(),
  dueDate:           z.coerce.date().optional(),
  estimatedDuration: z.number().int().min(1).max(1440).optional(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;