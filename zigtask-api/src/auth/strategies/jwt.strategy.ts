import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // console.log('jwt strategy', request.cookies);

          const authCookieName: string = this.config.get(
            'COOKIE_AUTH',
            'cookie_auth_task',
          );
          const cookies = request.cookies as Record<string, string>;

          const access_token: string | undefined = cookies[authCookieName];
          console.log({ access_token });

          if (!access_token) {
            return null;
          }
          // data = JSON.parse(data);
          //   if (typeof data === 'string') {
          //     data = JSON.parse(data);
          //   }

          return access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  // decode data.access_token from jwtFromRequest by secretOrKey
  // and return payload
  // returned value of this method will be assigned to request.user
  async validate(payload: JwtPayload) {
    console.log('validate jwt', payload);
    if (!payload || !payload?.sub) {
      throw new Error('Invalid JWT payload');
    }

    const user = await this.authService.getUserById(payload.sub);
    return user;
  }
}
