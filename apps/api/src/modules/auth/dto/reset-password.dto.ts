import { IsDefined, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
