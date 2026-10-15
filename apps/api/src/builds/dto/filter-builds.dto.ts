import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterBuildsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  classId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  specId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  guildId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyPublic?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  /** Builds votadas por este usuário */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  voterId?: number;

  @IsOptional()
  @IsIn(['popular', 'name', 'recent'])
  sort?: 'popular' | 'name' | 'recent';
}
