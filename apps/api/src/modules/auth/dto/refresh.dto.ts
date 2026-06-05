import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
