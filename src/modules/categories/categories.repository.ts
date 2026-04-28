import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Category } from '../../generated/prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}