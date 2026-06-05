import { Controller, Post, Body, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UserService } from './user.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.gaurd.js';
import type { AuthRequest } from '../auth/types/auth-request.js';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post("register")
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    return  this.userService.register(
      registerDto,
    );
  }
  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    return this.userService.getPublicProfile(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentProfile(@Req() req: AuthRequest) {
    return this.userService.getCurrentProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, dto);
  }}