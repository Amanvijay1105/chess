import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
