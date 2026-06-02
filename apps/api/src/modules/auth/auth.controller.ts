import { Controller,Post,Body } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto.js";
import { AuthService } from "./auth.service.js";

@Controller('/api/auth')
export class AuthController{
    constructor(
        private readonly AuthService:AuthService
    ){}

    @Post('login')
    async login(@Body() LoginDto:LoginDto){
        return this.AuthService.login(LoginDto)
    }
}