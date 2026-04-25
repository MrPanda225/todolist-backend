import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { Category } from '../../generated/prisma';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneByUser(id, userId);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(userId, dto);
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id, userId);
    return this.categoriesRepository.update(id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    return this.categoriesRepository.delete(id, userId);
  }
}