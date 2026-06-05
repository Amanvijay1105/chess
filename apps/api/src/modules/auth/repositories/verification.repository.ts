import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';

@Injectable()
export class VerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return await this.prisma.verificationToken.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string) {
    return await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });
  }

  async markUsed(tokenHash: string) {
    return await this.prisma.verificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.verificationToken.findFirst({
      where: { userId },
    });
  }
}
