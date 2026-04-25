import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TimeBlocksRepository } from './time-blocks.repository';
import { TasksService } from '../tasks/tasks.service';
import { CreateTimeBlockDto, UpdateTimeBlockDto } from './dto/time-blocks.dto';
import { TimeBlock } from '../../generated/prisma';

@Injectable()
export class TimeBlocksService {
  constructor(
    private readonly timeBlocksRepository: TimeBlocksRepository,
    private readonly tasksService:         TasksService,
  ) {}

  async findAll(userId: string): Promise<TimeBlock[]> {
    return this.timeBlocksRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<TimeBlock> {
    const block = await this.timeBlocksRepository.findOneByUser(id, userId);
    if (!block) throw new NotFoundException(`TimeBlock ${id} not found`);
    return block;
  }

  async create(userId: string, dto: CreateTimeBlockDto): Promise<TimeBlock> {
    return this.timeBlocksRepository.create(userId, dto);
  }

  async update(id: string, userId: string, dto: UpdateTimeBlockDto): Promise<TimeBlock> {
    await this.findOne(id, userId);
    return this.timeBlocksRepository.update(id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    return this.timeBlocksRepository.delete(id, userId);
  }

  async assignTask(timeBlockId: string, taskId: string, userId: string): Promise<void> {
    // Vérifie que le bloc et la tâche appartiennent au même user — IDOR prevention
    await this.findOne(timeBlockId, userId);
    await this.tasksService.findOne(taskId, userId);
    return this.timeBlocksRepository.assignTask(timeBlockId, taskId);
  }

  async unassignTask(timeBlockId: string, taskId: string, userId: string): Promise<void> {
    await this.findOne(timeBlockId, userId);
    await this.tasksService.findOne(taskId, userId);
    return this.timeBlocksRepository.unassignTask(timeBlockId, taskId);
  }
}