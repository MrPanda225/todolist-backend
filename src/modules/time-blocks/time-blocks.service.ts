import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeBlocksRepository }          from './time-blocks.repository';
import { TasksService }                  from '../tasks/tasks.service';
import { CreateTimeBlockDto, UpdateTimeBlockDto } from './dto/time-blocks.dto';

@Injectable()
export class TimeBlocksService {
  constructor(
    private readonly timeBlocksRepository: TimeBlocksRepository,
    private readonly tasksService:         TasksService,
  ) {}

  async findAll(userId: string): Promise<any[]> {
    return this.timeBlocksRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<any> {
    const block = await this.timeBlocksRepository.findOneByUser(id, userId);
    if (!block) throw new NotFoundException(`TimeBlock ${id} not found`);
    return block;
  }

  async create(userId: string, dto: CreateTimeBlockDto): Promise<any> {
    return this.timeBlocksRepository.create(userId, dto);
  }

  async update(id: string, userId: string, dto: UpdateTimeBlockDto): Promise<any> {
    const block = await this.findOne(id, userId);
    if (!block) throw new NotFoundException('TimeBlock not found');
    return this.timeBlocksRepository.update(block.id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    const block = await this.findOne(id, userId);
    if (!block) throw new NotFoundException('TimeBlock not found');
    return this.timeBlocksRepository.delete(block.id, userId);
  }

  async assignTask(timeBlockId: string, taskId: string, userId: string): Promise<void> {
    const block = await this.findOne(timeBlockId, userId);
    if (!block) throw new NotFoundException('TimeBlock not found');
    const task = await this.tasksService.findOne(taskId, userId);
    if (!task) throw new NotFoundException('Task not found');
    return this.timeBlocksRepository.assignTask(block.id, task.id);
  }

  async unassignTask(timeBlockId: string, taskId: string, userId: string): Promise<void> {
    const block = await this.findOne(timeBlockId, userId);
    if (!block) throw new NotFoundException('TimeBlock not found');
    const task = await this.tasksService.findOne(taskId, userId);
    if (!task) throw new NotFoundException('Task not found');
    return this.timeBlocksRepository.unassignTask(block.id, task.id);
  }
}