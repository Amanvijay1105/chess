import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { Prisma, VerificationToken } from '../../../generated/prisma/client.js';

@Injectable()
export class verificationTokenRespository {
  constructor(private prisma: PrismaService) {}

  async createToken(tokendata: Prisma.VerificationTokenCreateInput): Promise<VerificationToken> {
    return await this.prisma.verificationToken.create({
      data: tokendata,
    });
  }
}
