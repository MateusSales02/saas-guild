import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBuildItemDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  slot?: string;

  @IsOptional()
  @IsString()
  rarity?: string;
}
