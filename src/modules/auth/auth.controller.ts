import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import type { Response }      from 'express';
import { AuthService }        from './auth.service';
import { RegisterSchema }     from './dto/register.dto';
import type { RegisterDto }   from './dto/register.dto';
import { LoginSchema }        from './dto/login.dto';
import type { LoginDto }      from './dto/login.dto';
import { ZodValidationPipe }  from '../../common/pipes/zod-validation.pipe';
import { Public }             from '../../common/decorators/public.decorator';
import { JwtRefreshGuard }    from '../../common/guards/jwt-refresh.guard';
import { CurrentUser }        from '../../common/decorators/current-user.decorator';
import type { JwtPayload }    from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure:   true,
      sameSite: 'none',
      path:     '/',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refresh(user);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure:   true,
      sameSite: 'none',
      path:     '/',
    });
    return { message: 'Logged out' };
  }
}