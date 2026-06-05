import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { userRepository } from '../users/repositories/user.repository.js';
import { AuthRepository } from '../users/repositories/auth.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/constants.js';
@Module({
    imports : [
        JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '15m',
      },
    }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        userRepository,
        SessionRepository,
    ],
})
export class AuthModule {}