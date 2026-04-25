import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimeBlocksModule } from './modules/time-blocks/time-blocks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short',  ttl: 1000,    limit: 10   },
        { name: 'medium', ttl: 60000,   limit: 100  },
        { name: 'long',   ttl: 3600000, limit: 1000 },
      ],
    }),
    AuthModule,
    TasksModule,
    TimeBlocksModule,
    CategoriesModule,
    TagsModule,
    GamificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}