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

  @IsOptional()
  @IsString()
  albion_id?: string;

  @IsOptional()
  @IsString()
  item_id?: string;
}
