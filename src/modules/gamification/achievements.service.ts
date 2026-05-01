import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConditionType } from '../../generated/prisma';

interface StatsSnapshot {
  totalXp:        number;
  level:          number;
  tasksCompleted: number;
  currentStreak:  number;
}

export interface AchievementWithStatus {
  id:          string;
  name:        string;
  description: string;
  icon:        string;
  xpBonus:     number;
  conditionType:  string;
  conditionValue: number;
  unlocked:    boolean;
  unlockedAt:  string | null;
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Évalue tous les achievements non encore débloqués pour ce user.
   * Appelé par GamificationService.onTaskCompleted() après chaque DONE.
   */
  async evaluate(userId: string, stats: StatsSnapshot): Promise<void> {
    const allAchievements = await this.prisma.achievement.findMany();

    const unlocked = await this.prisma.userAchievement.findMany({
      where:  { userId },
      select: { achievementId: true },
    });

    // FIX : new Set(array) — pas new Set([array])
    const unlockedIds = new Set(unlocked.map(u => u.achievementId));

    const toUnlock = allAchievements.filter(a =>
      !unlockedIds.has(a.id) &&
      this.isMet(a.conditionType as ConditionType, a.conditionValue, stats),
    );

    if (toUnlock.length === 0) return;

    // Unlock en parallèle — pas de dépendance entre eux
    await Promise.all(
      toUnlock.map(achievement =>
        this.unlockAchievement(userId, achievement.id, achievement.xpBonus),
      ),
    );
  }

  /**
   * Retourne TOUS les achievements avec leur statut débloqué/verrouillé.
   * Le frontend affiche les deux états — pas seulement les débloqués.
   */
  async findAllByUser(userId: string): Promise<AchievementWithStatus[]> {
    const [allAchievements, userAchievements] = await Promise.all([
      this.prisma.achievement.findMany({ orderBy: { conditionValue: 'asc' } }),
      this.prisma.userAchievement.findMany({
        where:   { userId },
        select:  { achievementId: true, unlockedAt: true },
      }),
    ]);

    const unlockedMap = new Map(
      userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]),
    );

    return allAchievements.map(a => ({
      id:             a.id,
      name:           a.name,
      description:    a.description,
      icon:           a.icon,
      xpBonus:        a.xpBonus,
      conditionType:  a.conditionType,
      conditionValue: a.conditionValue,
      unlocked:       unlockedMap.has(a.id),
      unlockedAt:     unlockedMap.get(a.id)?.toISOString() ?? null,
    }));
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

    // XP bonus attribué directement — sans repasser par evaluate()
    // pour éviter une récursion infinie
    if (xpBonus > 0) {
      await this.prisma.userStats.update({
        where: { userId },
        data:  { totalXp: { increment: xpBonus } },
      });
    }
  }
}