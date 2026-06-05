import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma/prisma.service.js';
import type { Prisma, Player } from '../../../../generated/prisma/client.js';

@Injectable()
export class PlayerRespository {
  constructor(private prisma: PrismaService) {}

  async create(player: Prisma.PlayerCreateInput): Promise<Player> {
    return await this.prisma.player.create({
      data: player,
    });
  }
}
