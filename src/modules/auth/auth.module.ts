import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';
import { appConfig } from '../../config/app.config';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret:      appConfig.jwt.access.secret,
      signOptions: { expiresIn: appConfig.jwt.access.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}