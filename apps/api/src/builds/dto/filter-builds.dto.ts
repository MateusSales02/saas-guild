import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
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
}
