import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { appConfig } from '../../../config/app.config';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refresh_token ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:      appConfig.jwt.refresh.secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}