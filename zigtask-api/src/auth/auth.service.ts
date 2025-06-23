import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoginSession } from './entities/login-session.entity';
import { EntityManager, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
const bcrypt = require('bcrypt');
import { RegisterDto } from './dto';
import { LoginRequestDto } from './dto/login.dto';
import { Tokens } from './types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(LoginSession)
    private loginSessionRepository: Repository<LoginSession>,
    private jwtService: JwtService,
    private config: ConfigService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async isExistEmail(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user ? true : false;
  }

  async register(dto: RegisterDto): Promise<void> {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(dto.password, salt);
    const user = new User({});
    user.email = dto.email;
    user.password = hash;
    user.fullName = dto.fullName;
    await this.userRepo.save(user);
  }

  async login(loginRequestDto: LoginRequestDto): Promise<Tokens> {
    const user = await this.userRepo.findOne({
      where: { email: loginRequestDto.email },
      select: ['id', 'password', 'email', 'fullName'],
    });
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(
      loginRequestDto.password,
      user.password,
    );
    console.log({
      user,
    });

    if (!isValidPassword) {
      console.log('Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.createAccessToken(user);
    console.log('Access token created', accessToken);
    const [refreshToken, refreshTokenExp] = this.createNewRefreshToken();
    if (!refreshToken || !refreshTokenExp || !accessToken) {
      throw new ForbiddenException('Secrets not found');
    }
    console.log({
      user,
      accessToken: accessToken,
      refreshToken,
      refreshTokenExp,
      isRevoked: false,
    });
    const newLoginSession = new LoginSession({});
    newLoginSession.user = user;
    newLoginSession.accessToken = accessToken;
    newLoginSession.refreshToken = refreshToken;
    newLoginSession.refreshTokenExp = refreshTokenExp;
    newLoginSession.isRevoked = false;

    await this.loginSessionRepository.save(newLoginSession);
    console.log('Login session created', newLoginSession);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
      });
      return user;
    } catch {
      return null;
    }
  }

  private createNewRefreshToken(): [string, Date] {
    const date = new Date();
    const rfDuration: number = this.config.get<number>(
      'REFRESH_TOKEN_DURATION_SECONDS',
    );
    if (!rfDuration || isNaN(Number(rfDuration))) {
      throw new ForbiddenException('Secrets not found');
    }
    const refreshToken = `${uuidv4()}-${uuidv4()}`;

    const refreshTokenExp = new Date(
      date.getTime() + Number(rfDuration) * 60000,
    );

    return [refreshToken, refreshTokenExp];
  }

  private async createAccessToken(user: User): Promise<string> {
    const payload = {
      email: user.email,
      sub: user.id,
      fullName: user.fullName,
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('ACCESS_TOKEN_DURATION'),
    });
  }

  public async validRefreshToken(
    email: string,
    refreshToken: string,
  ): Promise<any> {
    let user = await this.userRepo.findOne({
      where: {
        email: email,
      },
    });
    let loginSession = await this.loginSessionRepository.findOne({
      where: {
        refreshToken: refreshToken,
        user: user,
      },
    });

    if (!loginSession || loginSession.isRevoked) {
      return null;
    }

    if (new Date(loginSession.refreshTokenExp) < new Date()) {
      await this.loginSessionRepository.update(
        { id: loginSession.id },
        { isRevoked: true },
      );
      return null;
    }

    return loginSession;
  }

  async logout(userId: string, fcmToken: string): Promise<void> {
    if (!fcmToken) {
      const loginSession = await this.loginSessionRepository.find({
        where: { user: { id: userId } },
      });
      if (!loginSession || loginSession.length === 0) {
        throw new UnauthorizedException('Invalid token');
      }
      for (const session of loginSession) {
        await this.loginSessionRepository.update(
          { id: session.id },
          { isRevoked: true },
        );
      }
      console.log('User logged out successfully from all sessions');
    } else {
      const loginSession = await this.loginSessionRepository.findOne({
        where: { fcmToken, user: { id: userId } },
      });
      await this.loginSessionRepository.update(
        { id: loginSession.id },
        { isRevoked: true },
      );
      if (!loginSession) {
        throw new UnauthorizedException('Invalid token');
      }
      console.log('User logged out successfully');
    }
  }

  async refreshAccessToken(tokenDto: Tokens): Promise<Tokens> {
    const loginSession = await this.loginSessionRepository.findOne({
      where: {
        refreshToken: tokenDto.refresh_token,
        accessToken: tokenDto.access_token,
      },
    });

    if (!loginSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date(loginSession.refreshTokenExp) < new Date()) {
      await this.loginSessionRepository.update(
        { id: loginSession.id },
        { isRevoked: true },
      );
      throw new UnauthorizedException(
        'Refresh token has expired. Please login',
      );
    }
    const checkValidAccessToken =
      loginSession.accessToken === tokenDto.access_token;
    if (!checkValidAccessToken) {
      throw new UnauthorizedException('Invalid access token');
    }

    const newAccessToken = await this.createAccessToken(loginSession.user);
    // create new
    const [newRefreshToken, refreshAccessToken] =
      await this.createNewRefreshToken();
    console.log('refresh token', loginSession);

    await this.loginSessionRepository.update(loginSession.id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenExp: refreshAccessToken,
    });

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }
}
