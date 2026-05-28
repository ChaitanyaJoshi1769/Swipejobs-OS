import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Session } from './entities/session.entity';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.verifyPassword(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user, ipAddress, userAgent);
  }

  async generateTokens(user: any, ipAddress?: string, userAgent?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      organization_id: user.organization_id,
      user_type: user.user_type,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    // Hash refresh token before storing
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Store refresh token session
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = this.sessionsRepository.create({
      id: sessionId,
      user_id: user.id,
      refresh_token_hash: refreshTokenHash,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    await this.sessionsRepository.save(session);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.usersService.findOne(payload.sub);

      // Verify session still exists and token matches
      const sessions = await this.sessionsRepository.find({
        where: { user_id: user.id },
      });

      let validSession = false;
      for (const session of sessions) {
        const isValidHash = await bcrypt.compare(
          refreshTokenDto.refresh_token,
          session.refresh_token_hash,
        );
        if (isValidHash && session.expires_at > new Date()) {
          validSession = true;
          break;
        }
      }

      if (!validSession) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.sessionsRepository.delete({ user_id: userId });
  }
}
