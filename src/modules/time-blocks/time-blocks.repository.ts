import { Injectable }    from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTimeBlockDto, UpdateTimeBlockDto } from './dto/time-blocks.dto';

/** Transforme un TimeBlock Prisma en réponse API propre. */
function toTimeBlockResponse(block: any) {
  return {
    id:          block.id,
    userId:      block.userId,
    title:       block.title,
    startTime:   block.startTime?.toISOString() ?? null,
    endTime:     block.endTime?.toISOString()   ?? null,
    date:        block.startTime
      ? block.startTime.toISOString().split('T')[0]
      : null,
    color:       block.color       ?? null,
    isRecurring: block.isRecurring ?? false,
    createdAt:   block.createdAt?.toISOString() ?? null,
    tasks:       (block.taskTimeBlocks ?? []).map((tb: any) => ({
      id:     tb.task.id,
      title:  tb.task.title,
      status: tb.task.status,
    })),
  };
}

@Injectable()
export class TimeBlocksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    const blocks = await this.prisma.timeBlock.findMany({
      where:   { userId },
      include: { taskTimeBlocks: { include: { task: true } } },
      orderBy: { startTime: 'asc' },
    });
    return blocks.map(toTimeBlockResponse);
  }

  async findOneByUser(id: string, userId: string) {
    const block = await this.prisma.timeBlock.findFirst({
      where:   { id, userId },
      include: { taskTimeBlocks: { include: { task: true } } },
    });
    return block ? toTimeBlockResponse(block) : null;
  }

  async create(userId: string, dto: CreateTimeBlockDto) {
    const block = await this.prisma.timeBlock.create({
      data:    { ...dto, userId },
      include: { taskTimeBlocks: { include: { task: true } } },
    });
    return toTimeBlockResponse(block);
  }

  async update(id: string, userId: string, dto: UpdateTimeBlockDto) {
    const block = await this.prisma.timeBlock.update({
      where:   { id, userId },
      data:    dto,
      include: { taskTimeBlocks: { include: { task: true } } },
    });
    return toTimeBlockResponse(block);
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