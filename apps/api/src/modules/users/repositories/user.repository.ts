import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service.js';
import type { Prisma, User } from '../../../generated/prisma/client.js';

@Injectable()
export class userRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findbyEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findPublicProfileByUsername(username: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        countryCode: true,
        player: {
          select: {
            title: true,
            ratings: true,
          },
        },
      },
    });
  }

  async findProfileById(id: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            ratings: true,
          },
        },
      },
    });
  }

  async updateProfile(id: string, user: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: user,
      include: {
        player: {
          include: {
            ratings: true,
          },
        },
      },
    });
  }

  async create(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data: user,
    });
  }

  async update(id: string, user: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: user,
    });
  }
}
