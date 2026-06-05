import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { LogoutDto } from './dto/logout.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.gaurd.js';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.AuthService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.AuthService.refresh(dto);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return this.AuthService.logout(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Req() req: any) {
    return this.AuthService.logoutAll(req.user.sub);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.AuthService.verifyEmail(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.AuthService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.AuthService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }
}
