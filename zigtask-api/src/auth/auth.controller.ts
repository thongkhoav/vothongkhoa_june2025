import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/common/decorators';
import { RegisterDto } from './dto';
import { LoginRequestDto } from './dto/login.dto';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(@Body() dto: RegisterDto): Promise<string> {
    try {
      const isExist = await this.authService.isExistEmail(dto.email);
      if (isExist) {
        throw new BadRequestException('User with this email already exists');
      }
      await this.authService.register(dto);
      return 'User created';
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Registration failed');
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signinLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequestDto,
  ): Promise<any> {
    const tokens = await this.authService.login(dto);
    const authCookieName: string = this.config.get(
      'COOKIE_AUTH',
      'cookie_auth_task',
    );

    res.cookie(authCookieName, tokens.access_token, {
      maxAge: 1000 * 60 * 15, // 15m
      httpOnly: false, // set to true in production
      secure: true, // set to true in production
      sameSite: 'none', // set to 'strict' in production
    });

    return tokens;
  }

  @Get('protected')
  @HttpCode(HttpStatus.OK)
  protected(@Req() request): any {
    try {
      console.log('test protected route ', (request as any).user);

      const refresh_token =
        request.cookies[
          this.config.get('COOKIE_REFRESH', 'cookie_refresh_task')
        ];
      const access_token =
        request.cookies[this.config.get('COOKIE_AUTH', 'cookie_auth_task')];
      console.log('refresh_token', refresh_token);
      console.log('access_token', access_token);
      return 'asasd';
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in protected route:', error.message);
      }
      throw new BadRequestException('Error accessing protected route');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body('fcmToken') fcmToken: string,
  ): Promise<string> {
    try {
      const curUserId = req?.user?.id;
      if (!curUserId) {
        throw new BadRequestException('User not found');
      }
      // get tokens from cookies

      // const access_token =
      //   req.cookies[this.config.get('COOKIE_AUTH', 'cookie_auth_task')];

      await this.authService.logout(curUserId, fcmToken);
      res.clearCookie(this.config.get('COOKIE_AUTH', 'cookie_auth_task'));
      return 'Logged out';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Public()
  // @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body('refresh_token') refresh_token: string,
    @Req() req,

    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // const refreshCookieName: string = this.config.get(
    //   'COOKIE_REFRESH',
    //   'cookie_refresh_task',
    // );
    const authCookieName: string = this.config.get(
      'COOKIE_AUTH',
      'cookie_auth_task',
    );
    const access_token = req.cookies[authCookieName];
    if (!refresh_token || !access_token) {
      throw new BadRequestException(
        'Refresh token or access token not provided',
      );
    }
    const tokens = await this.authService.refreshAccessToken({
      refresh_token,
      access_token,
    });
    console.log('refresh tokens', tokens);
    res.cookie(authCookieName, tokens.access_token, {
      maxAge: 1000 * 60 * 15, // 15m
      httpOnly: false, // set to true in production
      secure: true, // set to true in production
      sameSite: 'none', // set to 'none' in production
    });
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }
}
