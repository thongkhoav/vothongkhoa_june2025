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
    const refreshCookieName: string = this.config.get(
      'COOKIE_REFRESH',
      'cookie_refresh_task',
    );
    const rtDuration: number = this.config.get(
      'REFRESH_TOKEN_DURATION_SECONDS',
      1000 * 60 * 60 * 24 * 7, // 7 days
    );

    res.cookie(authCookieName, tokens.access_token, {
      maxAge: 1000 * 60 * 15, // 15m
      httpOnly: false, // set to true in production
      secure: false, // set to true in production
      sameSite: 'strict', // set to 'none' in production
    });
    res.cookie(refreshCookieName, tokens.refresh_token, {
      maxAge: rtDuration, // 7 days
      httpOnly: true, // set to true in production
      secure: false, // set to true in production
      sameSite: 'strict', // set to 'none' in production
    });

    return tokens;
  }

  @Get('protected')
  @HttpCode(HttpStatus.OK)
  protected(@Req() request: Request): any {
    try {
      console.log('test protected route ', (request as any).user);
      return 'asasd';
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error in protected route:', error.message);
      }
      throw new BadRequestException('Error accessing protected route');
    }
  }

  // @Public()
  // @UseGuards(RefreshTokenGuard)
  // @Post('refresh')
  // @HttpCode(HttpStatus.OK)
  // refreshTokens(
  //   @GetCurrentUserId() userId: number,
  //   @GetCurrentUser('refreshToken') refreshToken: string,
  // ): Promise<Tokens> {
  // res.cookie('access_token', tokens.access_token, {
  //   maxAge: 1000 * 60 * 60 * 24 * 7,
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'none',
  // });
}
