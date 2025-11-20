import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum EventType {
  RAID = 'RAID',
  GATHERING = 'GATHERING',
  DUNGEON = 'DUNGEON',
  PVP = 'PVP',
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
}
