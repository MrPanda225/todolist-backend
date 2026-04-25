import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TimeBlock } from '../../generated/prisma';
import { CreateTimeBlockDto } from './dto/time-blocks.dto';
import { UpdateTimeBlockDto } from './dto/time-blocks.dto';

@Injectable()
export class TimeBlocksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<TimeBlock[]> {
    return this.prisma.timeBlock.findMany({
      where:   { userId },
      include: { taskTimeBlocks: { include: { task: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<TimeBlock | null> {
    return this.prisma.timeBlock.findFirst({
      where:   { id, userId },
      include: { taskTimeBlocks: { include: { task: true } } },
    });
  }

  async create(userId: string, dto: CreateTimeBlockDto): Promise<TimeBlock> {
    return this.prisma.timeBlock.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateTimeBlockDto): Promise<TimeBlock> {
    return this.prisma.timeBlock.update({
      where: { id, userId },
      data:  dto,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.timeBlock.delete({
      where: { id, userId },
    });
  }

  async assignTask(timeBlockId: string, taskId: string): Promise<void> {
    await this.prisma.taskTimeBlock.create({
      data: { timeBlockId, taskId },
    });
  }

  async unassignTask(timeBlockId: string, taskId: string): Promise<void> {
    await this.prisma.taskTimeBlock.delete({
      where: { taskId_timeBlockId: { taskId, timeBlockId } },
    });
  }
}