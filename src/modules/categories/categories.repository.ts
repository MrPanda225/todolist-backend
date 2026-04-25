import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Category } from '../../generated/prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where:   { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { id, userId } });
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto): Promise<Category> {
    return this.prisma.category.update({ where: { id, userId }, data: dto });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.category.delete({ where: { id, userId } });
  }
}