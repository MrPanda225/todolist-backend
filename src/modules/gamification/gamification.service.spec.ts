import { Test } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../../database/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('GamificationService', () => {
  let service:      GamificationService;
  let prisma:       DeepMockProxy<PrismaService>;
  let achievements: DeepMockProxy<AchievementsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService,       useValue: mockDeep<PrismaService>()       },
        { provide: AchievementsService, useValue: mockDeep<AchievementsService>() },
      ],
    }).compile();

    service      = module.get(GamificationService);
    prisma       = module.get(PrismaService);
    achievements = module.get(AchievementsService);
  });

  describe('computeLevel (via onTaskCompleted)', () => {
    const baseStats = {
      id:              'stats-1',
      userId:          'user-1',
      totalXp:         0,
      level:           1,
      currentStreak:   0,
      longestStreak:   0,
      tasksCompleted:  0,
      lastActivityDate: null,
    };

    it('reste niveau 1 sous 50 XP', async () => {
      prisma.userStats.findUnique.mockResolvedValue({ ...baseStats, totalXp: 40 });
      prisma.userStats.update.mockResolvedValue({ ...baseStats, totalXp: 49, level: 1 });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 9);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ level: 1 }) }),
      );
    });

    it('passe niveau 2 à 50 XP', async () => {
      prisma.userStats.findUnique.mockResolvedValue({ ...baseStats, totalXp: 45 });
      prisma.userStats.update.mockResolvedValue({ ...baseStats, totalXp: 50, level: 2 });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 5);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ level: 2 }) }),
      );
    });

    it('passe niveau 5 à 370 XP', async () => {
      prisma.userStats.findUnique.mockResolvedValue({ ...baseStats, totalXp: 360 });
      prisma.userStats.update.mockResolvedValue({ ...baseStats, totalXp: 370, level: 5 });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 10);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ level: 5 }) }),
      );
    });
  });

  describe('streak', () => {
    const baseStats = {
      id:              'stats-1',
      userId:          'user-1',
      totalXp:         0,
      level:           1,
      currentStreak:   0,
      longestStreak:   0,
      tasksCompleted:  0,
      lastActivityDate: null,
    };

    it('démarre un streak à 1 si pas de lastActivityDate', async () => {
      prisma.userStats.findUnique.mockResolvedValue({ ...baseStats, lastActivityDate: null });
      prisma.userStats.update.mockResolvedValue({ ...baseStats });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 10);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentStreak: 1 }) }),
      );
    });

    it('incrémente le streak si lastActivity était hier', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      prisma.userStats.findUnique.mockResolvedValue({
        ...baseStats,
        currentStreak:    3,
        longestStreak:    3,
        lastActivityDate: yesterday,
      });
      prisma.userStats.update.mockResolvedValue({ ...baseStats });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 10);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentStreak: 4 }) }),
      );
    });

    it('remet le streak à 1 si lastActivity était il y a 2 jours', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      prisma.userStats.findUnique.mockResolvedValue({
        ...baseStats,
        currentStreak:    5,
        longestStreak:    5,
        lastActivityDate: twoDaysAgo,
      });
      prisma.userStats.update.mockResolvedValue({ ...baseStats });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 10);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentStreak: 1 }) }),
      );
    });

    it('ne change pas le streak si déjà complété aujourd\'hui', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      prisma.userStats.findUnique.mockResolvedValue({
        ...baseStats,
        currentStreak:    3,
        lastActivityDate: today,
      });
      prisma.userStats.update.mockResolvedValue({ ...baseStats });
      achievements.evaluate.mockResolvedValue(undefined);

      await service.onTaskCompleted('user-1', 10);

      expect(prisma.userStats.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ currentStreak: 3 }) }),
      );
    });
  });
});