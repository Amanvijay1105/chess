import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma/prisma.service.js";

@Injectable()
export class AuthRepository{
    constructor(private prisma:PrismaService){}

    async findLocalAccount(userId:string):Promise<any | null>{
        return await this.prisma.account.findFirst({
            where:{
                userId : userId,
                provider : 'LOCAL'
            }
        })
    }
    async create(account:any){
        return await this.prisma.account.create({
            data:account
        })
    }
}