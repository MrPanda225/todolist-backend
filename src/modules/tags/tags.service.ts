import { Injectable, NotFoundException } from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import { CreateTagDto } from './dto/tags.dto';
import { Tag } from '../../generated/prisma';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async findAll(userId: string): Promise<Tag[]> {
    return this.tagsRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOneByUser(id, userId);
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    return this.tagsRepository.create(userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    return this.tagsRepository.delete(id, userId);
  }

  async assignToTask(taskId: string, tagId: string, userId: string): Promise<void> {
    await this.findOne(tagId, userId);
    return this.tagsRepository.assignToTask(taskId, tagId);
  }

  async unassignFromTask(taskId: string, tagId: string, userId: string): Promise<void> {
    await this.findOne(tagId, userId);
    return this.tagsRepository.unassignFromTask(taskId, tagId);
  }
}