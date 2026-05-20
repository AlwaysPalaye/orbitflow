import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UsersRepository } from '../users/users.repository';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { RedisService } from '@/redis/redis.service';

/**
 * Auth service - handles registration, login, and token management.
 * Follows refresh token rotation per SECURITY_RULES.md.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    const user = await this.usersRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const tokens = await this.generateTokens(user.id, user.email);

    this.eventEmitter.emit('auth.registered', { userId: user.id, email: user.email });
    this.logger.log(`User registered: ${user.id}`);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.eventEmitter.emit('auth.login_failed', { userId: user.id, email: user.email });
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersRepository.updateLastLogin(user.id);
    this.eventEmitter.emit('auth.logged_in', { userId: user.id });
    this.logger.log(`User logged in: ${user.id}`);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const storedData = await this.redisService.get(`refresh:${refreshToken}`);
    if (!storedData) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Invalidate old refresh token (rotation)
    await this.redisService.del(`refresh:${refreshToken}`);

    const { userId, email } = JSON.parse(storedData);
    const tokens = await this.generateTokens(userId, email);

    this.logger.log(`Tokens refreshed for user: ${userId}`);

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    await this.redisService.set(
      `refresh:${refreshToken}`,
      JSON.stringify({ userId, email }),
      this.REFRESH_TOKEN_TTL,
    );

    return { accessToken, refreshToken };
  }
}
