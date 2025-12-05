import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
} from 'class-validator';

export enum EventType {
  RAID = 'RAID',
  GATHERING = 'GATHERING',
  DUNGEON = 'DUNGEON',
  PVP = 'PVP',
}

export enum RecurrencePattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsEnum(EventType)
  type: EventType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsInt()
  guildId: number;

  // Campos de recorrência
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsEnum(RecurrencePattern)
  recurrence_pattern?: RecurrencePattern;

  @IsOptional()
  @IsInt()
  recurrence_interval?: number;

  @IsOptional()
  @IsDateString()
  recurrence_end_date?: string;
}
