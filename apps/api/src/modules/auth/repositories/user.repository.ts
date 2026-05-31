import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma/prisma.service.js';

@Injectable()
export class userRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<any | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findbyEmail(email: string): Promise<any| null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<any | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(user:any){
    return this.prisma.user.create({
        data : user
    })
  }
  async update(id:string,user:any){
    return this.prisma.user.update({
        where : {
            id : id
        },
        data : user
    })
  }
}
