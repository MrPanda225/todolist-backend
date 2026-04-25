import { Test } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../../database/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let prisma:  DeepMockProxy<PrismaService>;

  const mockAchievements = [
    { id: 'ach-1', name: 'Premier pas', description: '', icon: 'star', xpBonus: 10, conditionType: 'TASKS_COMPLETED', conditionValue: 1  },
    { id: 'ach-2', name: 'En route',    description: '', icon: 'rocket', xpBonus: 25, conditionType: 'TASKS_COMPLETED', conditionValue: 10 },
    { id: 'ach-3', name: 'En feu',      description: '', icon: 'fire',  xpBonus: 50, conditionType: 'STREAK',          conditionValue: 7  },
    { id: 'ach-4', name: "Gagneur d'XP",description: '', icon: 'coin',  xpBonus: 50, conditionType: 'XP_EARNED',       conditionValue: 500},
  ];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get(AchievementsService);
    prisma  = module.get(PrismaService);
  });

  it('unlock "Premier pas" quand tasksCompleted = 1', async () => {
    prisma.achievement.findMany.mockResolvedValue(mockAchievements as any);
    prisma.userAchievement.findMany.mockResolvedValue([]);
    prisma.userAchievement.create.mockResolvedValue({} as any);
    prisma.userStats.update.mockResolvedValue({} as any);

    await service.evaluate('user-1', {
      totalXp: 10, level: 1, tasksCompleted: 1, currentStreak: 1,
    });

    expect(prisma.userAchievement.create).toHaveBeenCalledTimes(1);
    expect(prisma.userAchievement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ achievementId: 'ach-1' }) }),
    );
  });

  it('ne recrée pas un achievement déjà débloqué', async () => {
    prisma.achievement.findMany.mockResolvedValue(mockAchievements as any);
    prisma.userAchievement.findMany.mockResolvedValue([
      { achievementId: 'ach-1' } as any,
    ]);
    prisma.userAchievement.create.mockResolvedValue({} as any);
    prisma.userStats.update.mockResolvedValue({} as any);

    await service.evaluate('user-1', {
      totalXp: 10, level: 1, tasksCompleted: 1, currentStreak: 1,
    });

    expect(prisma.userAchievement.create).not.toHaveBeenCalled();
  });

  it('unlock plusieurs achievements en même temps', async () => {
    prisma.achievement.findMany.mockResolvedValue(mockAchievements as any);
    prisma.userAchievement.findMany.mockResolvedValue([]);
    prisma.userAchievement.create.mockResolvedValue({} as any);
    prisma.userStats.update.mockResolvedValue({} as any);

    await service.evaluate('user-1', {
      totalXp: 500, level: 1, tasksCompleted: 10, currentStreak: 7,
    });

    // Premier pas + En route + En feu + Gagneur d'XP = 4
    expect(prisma.userAchievement.create).toHaveBeenCalledTimes(4);
  });
});