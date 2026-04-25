import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from '../../../config/app.config';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor() {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      appConfig.jwt.access.secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}