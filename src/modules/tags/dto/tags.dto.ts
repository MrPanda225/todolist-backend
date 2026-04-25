import { z } from 'zod';

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
});

export const UpdateTagSchema = CreateTagSchema.partial();

export type CreateTagDto = z.infer<typeof CreateTagSchema>;
export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;