import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [GamificationController],
  providers:   [GamificationService, AchievementsService, PrismaService],
  exports:     [GamificationService],
})
export class GamificationModule {}