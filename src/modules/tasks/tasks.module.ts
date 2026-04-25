import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { PrismaService } from '../../database/prisma.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports:     [GamificationModule],
  controllers: [TasksController],
  providers:   [TasksService, TasksRepository, PrismaService],
  exports:     [TasksService],
})
export class TasksModule {}