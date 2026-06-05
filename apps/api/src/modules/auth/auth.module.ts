import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { userRepository } from '../users/repositories/user.repository.js';
import { AuthRepository } from '../users/repositories/auth.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { VerificationRepository } from './repositories/verification.repository.js';
import { PasswordResetRepository } from './repositories/password-reset.repository.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.gaurd.js';
@Module({
    imports : [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const secret = configService.get<string>('JWT_SECRET');
            if (!secret) {
              throw new Error('JWT_SECRET environment variable is not defined');
            }
            return {
              secret,
              signOptions: {
                expiresIn: '15m',
              },
            };
          },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        userRepository,
        SessionRepository,
        VerificationRepository,
        PasswordResetRepository,
        JwtStrategy,
        JwtAuthGuard,
    ],
})
export class AuthModule {}