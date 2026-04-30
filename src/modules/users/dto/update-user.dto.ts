import { z } from 'zod';

export const UpdateUserSchema = z.object({
  username:  z.string().min(3).max(30).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName:  z.string().min(1).max(50).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;