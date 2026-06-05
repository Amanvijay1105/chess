import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: any) {
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
}
