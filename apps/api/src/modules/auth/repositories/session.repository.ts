import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { Prisma, Session } from '../../../generated/prisma/client.js';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: Prisma.SessionCreateInput): Promise<Session> {
    return await this.prisma.session.create({
      data: session,
    });
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return await this.prisma.session.findFirst({
      where: { refreshTokenHash },
    });
  }

  async revokeSession(sessionId: string) {
    return await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessions(userId: string) {
    return await this.prisma.session.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  async countActiveSessions(userId: string): Promise<number> {
    return await this.prisma.session.count({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }
}
