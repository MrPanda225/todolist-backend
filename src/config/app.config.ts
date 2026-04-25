import { env } from './env.config';

const parseExpiry = (value: string): number => {
  if (value.endsWith('m')) return parseInt(value) * 60;
  if (value.endsWith('h')) return parseInt(value) * 3600;
  if (value.endsWith('d')) return parseInt(value) * 86400;
  return parseInt(value);
};

export const appConfig = {
  bcrypt: {
    saltRounds: 12,
  },
  jwt: {
    access: {
      secret:    env.JWT_ACCESS_SECRET,
      expiresIn: parseExpiry(env.JWT_ACCESS_EXPIRES_IN),
    },
    refresh: {
      secret:    env.JWT_REFRESH_SECRET,
      expiresIn: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
    },
  },
} as const;