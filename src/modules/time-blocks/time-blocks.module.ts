import { Module } from '@nestjs/common';
import { TimeBlocksController } from './time-blocks.controller';
import { TimeBlocksService } from './time-blocks.service';
import { TimeBlocksRepository } from './time-blocks.repository';
import { PrismaService } from '../../database/prisma.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports:     [TasksModule],
  controllers: [TimeBlocksController],
  providers:   [TimeBlocksService, TimeBlocksRepository, PrismaService],
})
export class TimeBlocksModule {}