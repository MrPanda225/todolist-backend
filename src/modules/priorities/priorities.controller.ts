import { Controller, Get } from '@nestjs/common';
import { PrismaService }   from '../../database/prisma.service';

@Controller('priorities')
export class PrioritiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.priority.findMany({
      orderBy: { level: 'desc' },
    });
  }
}