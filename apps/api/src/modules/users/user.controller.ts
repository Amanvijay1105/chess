import { Controller, Post, Body } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto.js";
import { UserService } from "./user.service.js";

@Controller("api/user")
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
}