import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { RegisterDto } from './dto/register.dto.js';

import { userRepository } from './repositories/user.repository.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { verificationTokenRespository } from './repositories/verification.repository.js';

import { PlayerRespository } from '../players/respositories/players.respository.ts/player.repository.js';

import { createHashPassword } from '../../utils/password.util.js';
import { PrismaService } from '../../database/prisma/prisma.service.js';
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS } from '../auth/constants/auth.constants.js';

import crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: userRepository,
    private readonly authRepository: AuthRepository,
    private readonly verificationTokenRepository: verificationTokenRespository,
    private readonly playerRepository: PlayerRespository,
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
}