import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { appConfig } from '../../config/app.config';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { User } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService:      JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const emailTaken    = await this.usersRepository.findByEmail(dto.email);
    const usernameTaken = await this.usersRepository.findByUsername(dto.username);

    if (emailTaken || usernameTaken) {
      throw new ConflictException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, appConfig.bcrypt.saltRounds);

    const user = await this.usersRepository.create({
      username:     dto.username,
      email:        dto.email,
      firstName:    dto.firstName,
      lastName:     dto.lastName,
      passwordHash,
    });

    return { accessToken: this.generateAccessToken(user) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findByEmail(dto.email);

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? '$2b$12$invalidhashtopreventtimingattack',
    );

    if (!user || !passwordMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return {
      accessToken:  this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  refresh(user: JwtPayload): { accessToken: string } {
    const accessToken = this.jwtService.sign(
      { sub: user.sub, email: user.email, username: user.username },
      { secret: appConfig.jwt.access.secret, expiresIn: appConfig.jwt.access.expiresIn },
    );
    return { accessToken };
  }

  generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      sub:      user.id,
      email:    user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      secret:    appConfig.jwt.refresh.secret,
      expiresIn: appConfig.jwt.refresh.expiresIn,
    });
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub:      user.id,
      email:    user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      secret:    appConfig.jwt.access.secret,
      expiresIn: appConfig.jwt.access.expiresIn,
    });
  }
}