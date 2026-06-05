import {
  Injectable,
  Inject,
  Scope,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { type Request } from 'express';

import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { userRepository } from '../users/repositories/user.repository.js';
import { AuthRepository } from '../users/repositories/auth.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { VerificationRepository } from './repositories/verification.repository.js';
import { PasswordResetRepository } from './repositories/password-reset.repository.js';
import { JwtPayload } from './types/jwt-payload.js';
import { REFRESH_EXPIRY_MS } from './constants/auth.constants.js';

import { comparePassword } from '../../utils/password.util.js';
import { generateTokenString, hashToken } from '../../utils/refreshToken.js';

import { JwtService } from '@nestjs/jwt';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,

    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: userRepository,
    private readonly authRepository: AuthRepository,
    private readonly verificationRepository: VerificationRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly JwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const ipAddress = this.request.ip;
    const userAgent = this.request.headers['user-agent'] ?? '';

    const { email, password } = dto;
    const user = await this.userRepository.findbyEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'ACTIVE') {
      throw new ConflictException(
        `User account is ${user.status.toLowerCase()}`,
      );
    }

    const account = await this.authRepository.findLocalAccount(user.id);
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await comparePassword(
      password,
      account.passwordHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.JwtService.signAsync(payload);

    const refreshToken = generateTokenString();
    const refreshTokenHash = await hashToken(refreshToken);

    await this.sessionRepository.create({
      userId: user.id,
      accountId: account.id,
      ipAddress,
      userAgent,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(dto: RefreshDto) {
    const refreshTokenHash = await hashToken(dto.refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(
      refreshTokenHash,
    );

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.JwtService.signAsync(payload);

    return { accessToken };
  }

  async logout(dto: LogoutDto) {
    const refreshTokenHash = await hashToken(dto.refreshToken);
    const session = await this.sessionRepository.findByRefreshTokenHash(
      refreshTokenHash,
    );

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.sessionRepository.revokeSession(session.id);
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.sessionRepository.revokeAllSessions(userId);
    return { message: 'Logged out from all devices' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = await hashToken(dto.token);
    const verificationToken = await this.verificationRepository.findByTokenHash(
      tokenHash,
    );

    if (!verificationToken) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (verificationToken.usedAt) {
      throw new UnauthorizedException('Token already used');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    await this.userRepository.update(verificationToken.userId, {
      isVerified: true,
    });

    await this.verificationRepository.markUsed(tokenHash);
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findbyEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const resetToken = generateTokenString();
    const tokenHash = await hashToken(resetToken);

    await this.passwordResetRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    });

    return {
      message: 'Password reset token sent to email',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = await hashToken(dto.token);
    const resetToken = await this.passwordResetRepository.findByTokenHash(
      tokenHash,
    );

    if (!resetToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (resetToken.usedAt) {
      throw new UnauthorizedException('Token already used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const account = await this.authRepository.findLocalAccount(user.id);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    const hashedPassword = await comparePassword(
      dto.newPassword,
      account.passwordHash,
    );

    if (hashedPassword) {
      throw new ConflictException(
        'New password cannot be the same as old password',
      );
    }

    const { createHashPassword } = await import(
      '../../utils/password.util.js'
    );
    const newPasswordHash = await createHashPassword(dto.newPassword);

    await this.authRepository.updatePasswordHash(account.id, newPasswordHash);
    await this.passwordResetRepository.markUsed(tokenHash);
    await this.sessionRepository.revokeAllSessions(user.id);

    return { message: 'Password reset successfully' };
  }

  async oauthLogin(profile: any) {
    const ipAddress = this.request.ip;
    const userAgent = this.request.headers['user-agent'] ?? '';

    const email = profile?.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Email not provided by OAuth provider');
    }

    let user = await this.userRepository.findbyEmail(email);
    let account = null as any;

    if (!user) {
      const base = String(email).split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 16) || 'user';
      let username = base;
      let i = 0;
      while (await this.userRepository.findByUsername(username)) {
        i += 1;
        username = `${base}${i}`;
      }

      user = await this.userRepository.create({
        username,
        email,
        displayName: profile.displayName ?? username,
        isVerified: true,
      } as any);

      account = await this.authRepository.create({
        userId: user.id,
        provider: 'GOOGLE',
        providerAccountId: profile.id,
        providerEmail: email,
      } as any);

      await this.playerRepository.create({
        userId: user.id,
        title: 'NONE',
        fairPlayScore: 100,
      } as any);
    } else {
      account = this.authRepository.findByProvider
        ? await this.authRepository.findByProvider(user.id, 'GOOGLE')
        : null;

      if (!account) {
        account = await this.authRepository.create({
          userId: user.id,
          provider: 'GOOGLE',
          providerAccountId: profile.id,
          providerEmail: email,
        } as any);
      }
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.JwtService.signAsync(payload);
    const refreshToken = generateTokenString();
    const refreshTokenHash = await hashToken(refreshToken);

    await this.sessionRepository.create({
      userId: user.id,
      accountId: account.id,
      ipAddress,
      userAgent,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    } as any);

    return {
      user: {
        id: user.id,
        name: user.name ?? user.displayName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    };
  }
}
