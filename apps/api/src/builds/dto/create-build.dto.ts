import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBuildDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  classId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  specId?: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  itemIds?: number[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  guildId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  memberId?: number;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  price?: number;
}
