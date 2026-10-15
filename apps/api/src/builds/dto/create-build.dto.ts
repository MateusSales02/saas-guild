import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
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

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  loadout?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  author_name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @Matches(/^[\w-]{6,20}$/, {
    each: true,
    message: 'ID de vídeo do YouTube inválido',
  })
  videos?: string[];

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}
