import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RegisterDto } from './dto/register.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

import { userRepository } from './repositories/user.repository.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { verificationTokenRespository } from './repositories/verification.repository.js';

import { PlayerRespository } from '../players/respositories/players.respository.ts/player.repository.js';

import { createHashPassword } from '../../utils/password.util.js';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS } from '../auth/constants/auth.constants.js';
import { SessionRepository } from '../auth/repositories/session.repository.js';
import type { User } from '../../../generated/prisma/client.ts';
import crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: userRepository,
    private readonly authRepository: AuthRepository,
    private readonly verificationTokenRepository: verificationTokenRespository,
    private readonly playerRepository: PlayerRespository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async register(dto: RegisterDto) {
    const { username, email, password } = dto;
    const existingEmail =
      await this.userRepository.findbyEmail(email);

    if (existingEmail) {
      throw new ConflictException(
        'Email already exists',
      );
    }
    const existingUsername =
      await this.userRepository.findByUsername(
        username,
      );

    if (existingUsername) {
      throw new ConflictException(
        'Username already exists',
      );
    }
    const passwordHash = await createHashPassword(password);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await createHashPassword(rawToken);

    await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          displayName: username,
        },
      });

      await tx.account.create({
        data: {
          userId: newUser.id,
          provider: 'LOCAL',
          providerEmail: email,
          passwordHash,
        },
      });

      await tx.player.create({
        data: {
          userId: newUser.id,
          title: 'NONE',
          fairPlayScore: 100,
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          tokenHash,
          expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS),
        },
      });
    });

    return {
      message: 'User registered successfully',
    };
  }

  async getPublicProfile(username: string) {
    const user = await this.userRepository.findPublicProfileByUsername(
      username,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      countryCode: user.countryCode,
      title: user.player?.title ?? 'NONE',
      ratings: user.player?.ratings ?? [],
    };
  }

  async getCurrentProfile(userId: string) {
    const user = await this.userRepository.findProfileById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeSessionsCount = await this.sessionRepository.countActiveSessions(
      userId,
    );

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      countryCode: user.countryCode,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      title: user.player?.title ?? 'NONE',
      ratings: user.player?.ratings ?? [],
      activeSessionsCount,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { displayName, bio, avatarUrl, countryCode } = dto;
    const updated = await this.userRepository.updateProfile(userId, {
      displayName,
      bio,
      avatarUrl,
      countryCode,
    });

    return {
      id: updated.id,
      username: updated.username,
      displayName: updated.displayName,
      email: updated.email,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      countryCode: updated.countryCode,
      role: updated.role,
      status: updated.status,
      isVerified: updated.isVerified,
      title: updated.player?.title ?? 'NONE',
      ratings: updated.player?.ratings ?? [],
    };
  }
}

