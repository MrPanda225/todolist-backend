import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Tag } from '../../generated/prisma';
import { CreateTagDto } from './dto/tags.dto';

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where:   { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({ where: { id, userId } });
  }

  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    return this.prisma.tag.create({ data: { ...dto, userId } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id, userId } });
  }

  async assignToTask(taskId: string, tagId: string): Promise<void> {
    await this.prisma.taskTag.create({ data: { taskId, tagId } });
  }

  async unassignFromTask(taskId: string, tagId: string): Promise<void> {
    await this.prisma.taskTag.delete({
      where: { taskId_tagId: { taskId, tagId } },
    });
  }
}