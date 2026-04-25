import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConditionType } from '../../generated/prisma';

interface StatsSnapshot {
  totalXp:        number;
  level:          number;
  tasksCompleted: number;
  currentStreak:  number;
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Évalue tous les achievements non encore débloqués pour ce user.
   * Si une condition est remplie, unlock l'achievement et attribue le XP bonus.
   */
  async evaluate(userId: string, stats: StatsSnapshot): Promise<void> {
    const allAchievements = await this.prisma.achievement.findMany();
    const unlocked        = await this.prisma.userAchievement.findMany({
      where:  { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(unlocked.map(u => u.achievementId));
    const toUnlock    = allAchievements.filter(a =>
      !unlockedIds.has(a.id) && this.isMet(a.conditionType as ConditionType, a.conditionValue, stats),
    );

    if (toUnlock.length === 0) return;

    // Unlock en parallèle — pas de dépendance entre eux
    await Promise.all(
      toUnlock.map(achievement =>
        this.unlockAchievement(userId, achievement.id, achievement.xpBonus),
      ),
    );
  }

  async findAllByUser(userId: string) {
    return this.prisma.userAchievement.findMany({
      where:   { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  private isMet(
    conditionType:  ConditionType,
    conditionValue: number,
    stats:          StatsSnapshot,
  ): boolean {
    switch (conditionType) {
      case 'TASKS_COMPLETED': return stats.tasksCompleted >= conditionValue;
      case 'STREAK':          return stats.currentStreak  >= conditionValue;
      case 'LEVEL_REACHED':   return stats.level          >= conditionValue;
      case 'XP_EARNED':       return stats.totalXp        >= conditionValue;
      default:                return false;
    }
  }

  private async unlockAchievement(
    userId:        string,
    achievementId: string,
    xpBonus:       number,
  ): Promise<void> {
    await this.prisma.userAchievement.create({
      data: { userId, achievementId },
    });

    // Attribue le XP bonus directement sans recalculer les achievements
    // pour éviter une récursion infinie
    if (xpBonus > 0) {
      await this.prisma.userStats.update({
        where: { userId },
        data:  { totalXp: { increment: xpBonus } },
      });
    }
  }
}