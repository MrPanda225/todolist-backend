import { Module }               from '@nestjs/common';
import { PrioritiesController } from './priorities.controller';
import { PrismaService }        from '../../database/prisma.service';

@Module({
  controllers: [PrioritiesController],
  providers:   [PrismaService],
})
export class PrioritiesModule {}