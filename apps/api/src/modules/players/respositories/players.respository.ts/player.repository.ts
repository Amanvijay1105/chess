import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma/prisma.service.js";

@Injectable()
export class PlayerRespository{
    constructor(private prisma:PrismaService){}
    
    async create(player:any):Promise<any | null>{
        return await this.prisma.player.create({
            data : player
        })
    }
}