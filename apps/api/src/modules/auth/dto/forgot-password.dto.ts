import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsDefined()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;
}
