import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { Category } from '../../generated/prisma';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('Category not found');
    return this.categoriesRepository.update(category.id, dto);
  }

  async delete(id: string): Promise<void> {
   const category = await this.categoriesRepository.findOne(id);
    if (!category) throw new NotFoundException('Category not found');
    return this.categoriesRepository.delete(category.id);
  }
}