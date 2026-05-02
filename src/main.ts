import 'dotenv/config';
import { NestFactory }               from '@nestjs/core';
import { AppModule }                  from './app.module';
import helmet                         from 'helmet';
import cookieParser                   from 'cookie-parser';
import { env }                        from './config/env.config';
import { GlobalExceptionFilter }      from './common/filters/global-exception.filter';
import { SerializeInterceptor }       from './common/interceptors/serialize.interceptor';
import { SerializeDatesInterceptor }  from './common/interceptors/serialize-dates.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Un seul appel — deux appels séparés écrasent le premier dans NestJS
  app.useGlobalInterceptors(
    new SerializeInterceptor(),
    new SerializeDatesInterceptor(),
  );

  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin:      allowedOrigins,
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(env.PORT);
}

bootstrap();