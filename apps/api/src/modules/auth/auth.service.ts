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

import { userRepository } from '../users/repositories/user.repository.js';
import { AuthRepository } from '../users/repositories/auth.repository.js';
import { SessionRepository } from './repositories/session.repository.js';

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
    private readonly authRepository: AuthRepository
  ) {}

  async login(dto: LoginDto) {
    const ipAddress = this.request.ip;
    const userAgent = this.request.headers['user-agent'] ?? '';

    const { email, password } = dto;
    const user = await this.userRepository.findbyEmail(email);
    console.log(user)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'ACTIVE') {
      throw new ConflictException(
        `User account is ${user.status.toLowerCase()}`,
      );
    }
    const account = await this.authRepository.findLocalAccount(user.id);
    console.log(account);
    
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
    console.log(isMatch);
    
    const accessToken = generateTokenString()

    const refreshToken = generateTokenString();
    const refreshTokenHash = hashToken(refreshToken).toString();
    await this.sessionRepository.create({
      userId: user.id,
      accountId: account.id,
      ipAddress,
      userAgent,
      refreshTokenHash: refreshTokenHash,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ), // 7 days
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
}