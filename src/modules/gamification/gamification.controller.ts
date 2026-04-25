import { Controller, Get } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AchievementsService } from './achievements.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly gamificationService:  GamificationService,
    private readonly achievementsService:  AchievementsService,
  ) {}

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getStats(user.sub);
  }

  @Get('stats/next-level')
  getNextLevel(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getNextLevelXp(user.sub);
  }

  @Get('achievements')
  getAchievements(@CurrentUser() user: JwtPayload) {
    return this.achievementsService.findAllByUser(user.sub);
  }
}