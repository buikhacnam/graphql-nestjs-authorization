import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from 'src/auth/types/types';

interface RequestWithUser extends Request {
  permissions?: string[];
}
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(public config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_ACCESS_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: RequestWithUser, payload: JwtPayload) {
    if (this.hasPermission(payload, request?.permissions)) {
      return payload;
    } else {
      console.log('permission denied');
      return false;
    }
  }

  private hasPermission = (payload, permissions?: string[]) => {
    if (!permissions) {
      return true;
    }
    return permissions.some((p) => payload.permissions.includes(p));
  };
}
