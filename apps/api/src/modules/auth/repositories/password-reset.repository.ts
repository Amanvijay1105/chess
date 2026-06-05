import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { Prisma, PasswordResetToken } from '../../../generated/prisma/client.js';

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PasswordResetTokenCreateInput): Promise<PasswordResetToken> {
    return await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string) {
    return await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  }

  async markUsed(tokenHash: string) {
    return await this.prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }
}
