import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email:    z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName:  z.string().min(1).max(100),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;