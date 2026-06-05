import { Module } from '@nestjs/common';

import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { AuthModule } from '../auth/auth.module.js';

import { userRepository } from './repositories/user.repository.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { verificationTokenRespository } from './repositories/verification.repository.js';
import { SessionRepository } from '../auth/repositories/session.repository.js';

import { PlayerRespository } from '../players/respositories/players.respository.ts/player.repository.js';


@Module({
  imports: [AuthModule],
  controllers: [UserController],

  providers: [
    UserService,
    userRepository,
    AuthRepository,
    verificationTokenRespository,
    SessionRepository,
    PlayerRespository,
  ],
})
export class UserModule {}