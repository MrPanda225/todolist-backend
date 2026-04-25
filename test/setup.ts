import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { SerializeInterceptor } from '../src/common/interceptors/serialize.interceptor';

const testDbUrl = process.env.DATABASE_URL_TEST!;

if (!testDbUrl) {
  throw new Error('DATABASE_URL_TEST is not defined in .env');
}

process.env.DATABASE_URL = testDbUrl;

export async function createTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new SerializeInterceptor());

  await app.init();
  return app;
}