import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { userRepository } from '../users/repositories/user.repository.js';
import { AuthRepository } from '../users/repositories/auth.repository.js';
import { SessionRepository } from './repositories/session.repository.js';

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        userRepository,
        SessionRepository,
    ],
})
export class AuthModule {}