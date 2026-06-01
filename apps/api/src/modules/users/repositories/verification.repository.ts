import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma/prisma.service.js";

@Injectable()
export class verificationTokenRespository{
    constructor(private prisma:PrismaService){}

   
    async createToken(tokendata:any) {
    return await this.prisma.verificationToken.create({
        data : tokendata
    });
  }
   }