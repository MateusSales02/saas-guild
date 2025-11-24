import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGuildDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
