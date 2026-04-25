import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { TagsRepository } from './tags.repository';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [TagsController],
  providers:   [TagsService, TagsRepository, PrismaService],
  exports:     [TagsService],
})
export class TagsModule {}