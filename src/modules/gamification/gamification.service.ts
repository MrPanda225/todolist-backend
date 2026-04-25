import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AchievementsService } from './achievements.service';

const LEVEL_THRESHOLDS = [0, 50, 120, 220, 370, 570, 820, 1150, 1600, 2200];

function computeLevel(totalXp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

@Injectable()
export class GamificationService {
  constructor(
    private readonly prisma:              PrismaService,
    private readonly achievementsService: AchievementsService,
  ) {}

  /**
   * Point d'entrée principal — appelé quand une tâche passe en DONE.
   * Calcule et attribue l'XP, met à jour le streak, évalue les achievements.
   */
  async onTaskCompleted(userId: string, xpReward: number): Promise<void> {
    const stats = await this.getOrCreateStats(userId);

    const newXp            = stats.totalXp + xpReward;
    const newLevel         = computeLevel(newXp);
    const newTasksCompleted = stats.tasksCompleted + 1;

    const today     = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = stats.lastActivityDate
      ? new Date(stats.lastActivityDate)
      : null;

    const { newStreak, newLongest } = this.computeStreak(
      lastActivity,
      today,
      stats.currentStreak,
      stats.longestStreak,
    );

    await this.prisma.userStats.update({
      where: { userId },
      data:  {
        totalXp:         newXp,
        level:           newLevel,
        tasksCompleted:  newTasksCompleted,
        currentStreak:   newStreak,
        longestStreak:   newLongest,
        lastActivityDate: today,
      },
    });

    await this.achievementsService.evaluate(userId, {
      totalXp:        newXp,
      level:          newLevel,
      tasksCompleted: newTasksCompleted,
      currentStreak:  newStreak,
    });
  }

  async getStats(userId: string) {
    return this.getOrCreateStats(userId);
  }

  async getNextLevelXp(userId: string): Promise<{ current: number; next: number | null }> {
    const stats = await this.getOrCreateStats(userId);
    const nextThreshold = LEVEL_THRESHOLDS[stats.level] ?? null;
    return { current: stats.totalXp, next: nextThreshold };
  }

  private computeStreak(
    lastActivity: Date | null,
    today: Date,
    currentStreak: number,
    longestStreak: number,
  ): { newStreak: number; newLongest: number } {
    if (!lastActivity) {
      return { newStreak: 1, newLongest: Math.max(1, longestStreak) };
    }

    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Déjà complété aujourd'hui — streak inchangé
    if (diffDays === 0) {
      return { newStreak: currentStreak, newLongest: longestStreak };
    }

    // Hier — on continue le streak
    if (diffDays === 1) {
      const newStreak = currentStreak + 1;
      return { newStreak, newLongest: Math.max(newStreak, longestStreak) };
    }

    // Plus d'un jour — streak cassé, on repart à 1
    return { newStreak: 1, newLongest: longestStreak };
  }

  private async getOrCreateStats(userId: string) {
    const existing = await this.prisma.userStats.findUnique({ where: { userId } });
    if (existing) return existing;

    return this.prisma.userStats.create({
      data: {
        userId,
        totalXp:         0,
        level:           1,
        currentStreak:   0,
        longestStreak:   0,
        tasksCompleted:  0,
      },
    });
  }
}