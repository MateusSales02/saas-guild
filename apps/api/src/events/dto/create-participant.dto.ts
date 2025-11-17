import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ParticipantStatus } from './participant-status.enum';

export class CreateParticipantDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;
}
