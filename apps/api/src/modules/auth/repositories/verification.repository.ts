import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma/prisma.service.js";

@Injectable()
export class PlayerRespository{
    constructor(private prisma:PrismaService){}

    async createToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ) {
    return await this.prisma.verificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        usedAt: null,
      },
    });
  }
   }