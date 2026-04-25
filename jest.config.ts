import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      testMatch:   ['<rootDir>/src/**/*.spec.ts'],
      transform:   { '^.+\\.ts$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'js', 'json'],
    },
    {
      displayName: 'e2e',
      testMatch:   ['<rootDir>/test/**/*.e2e-spec.ts'],
      transform:   { '^.+\\.ts$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'js', 'json'],
    },
  ],
};

export default config;