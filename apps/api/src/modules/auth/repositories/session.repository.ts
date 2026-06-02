import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma/prisma.service.js";

@Injectable()
export class SessionRepository {
    constructor(private readonly prisma:PrismaService){}

    async create(session:any){
        return await this.prisma.session.create({
            data : session
        })
    }
}