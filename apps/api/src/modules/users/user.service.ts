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

import crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
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
    const passwordHash =
      await createHashPassword(password);

    const user =
      await this.userRepository.create({
        username,
        email,
        displayName: username,
      });
    await this.authRepository.create({
      userId: user.id,
      provider: 'LOCAL',
      providerEmail: email,
      passwordHash,
    })
    await this.playerRepository.create({
      userId: user.id,
      title: 'NONE',
      fairPlayScore: 100,
    });
    const rawToken =
      crypto.randomBytes(32).toString('hex');

    const tokenHash =
      await createHashPassword(rawToken);

    await this.verificationTokenRepository.createToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24,
      ), 
    });

    return {
      message:
        'User registered successfully',
    };
  }
}