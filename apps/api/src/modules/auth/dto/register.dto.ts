import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsDefined()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password!: string;
}
