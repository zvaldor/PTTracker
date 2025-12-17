import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import type { AuthResponse, CreateUserDto, LoginDto, MagicLinkDto } from '@pt/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        locale: dto.locale || 'en',
        themePreference: 'system',
      },
    });

    // Create default settings
    await this.prisma.settings.create({
      data: {
        userId: user.id,
        weekStartsOn: 'mon',
        enableCategories: true,
        enableDifficulty: true,
        enableDesire: true,
        difficultyMode: 'tshirt',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        locale: user.locale as 'en' | 'ru',
        themePreference: user.themePreference as 'system' | 'light' | 'dark',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        locale: user.locale as 'en' | 'ru',
        themePreference: user.themePreference as 'system' | 'light' | 'dark',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async requestMagicLink(dto: MagicLinkDto): Promise<{ message: string }> {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Create user if doesn't exist (passwordless)
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          locale: 'en',
          themePreference: 'system',
        },
      });

      await this.prisma.settings.create({
        data: {
          userId: user.id,
        },
      });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.magicLink.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await this.emailService.sendMagicLink(dto.email, token);

    return { message: 'Magic link sent to your email' };
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const magicLink = await this.prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!magicLink || magicLink.used || magicLink.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    await this.prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { used: true },
    });

    const tokens = await this.generateTokens(magicLink.user.id, magicLink.user.email);

    return {
      ...tokens,
      user: {
        id: magicLink.user.id,
        email: magicLink.user.email,
        locale: magicLink.user.locale as 'en' | 'ru',
        themePreference: magicLink.user.themePreference as 'system' | 'light' | 'dark',
        createdAt: magicLink.user.createdAt,
        updatedAt: magicLink.user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { secret: this.config.get('JWT_SECRET'), expiresIn: '1h' },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
