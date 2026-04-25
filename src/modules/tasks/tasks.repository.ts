import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Task, TaskStatus } from '../../generated/prisma';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where:   { userId },
      include: { priority: true, category: true, taskTags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where:   { id, userId },
      include: { priority: true, category: true, taskTags: { include: { tag: true } } },
    });
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    return this.prisma.task.update({
      where: { id, userId },
      data:  dto,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id, userId },
    });
  }

  async updateStatus(id: string, userId: string, status: TaskStatus): Promise<Task> {
    return this.prisma.task.update({
      where: { id, userId },
      data:  { status },
    });
  }
}