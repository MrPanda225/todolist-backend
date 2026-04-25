import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { GamificationService } from '../gamification/gamification.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from '../../generated/prisma';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository:    TasksRepository,
    private readonly gamificationService: GamificationService,
  ) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.tasksRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOneByUser(id, userId);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.create(userId, dto);
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id, userId);
    return this.tasksRepository.update(id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    return this.tasksRepository.delete(id, userId);
  }

  async updateStatus(id: string, userId: string, status: TaskStatus): Promise<Task> {
    const task    = await this.findOne(id, userId);
    const updated = await this.tasksRepository.updateStatus(id, userId, status);

    // Déclenche la gamification uniquement quand on passe en DONE
    // et que la tâche n'était pas déjà DONE
    if (status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      await this.gamificationService.onTaskCompleted(userId, task.xpReward);
    }

    return updated;
  }
}