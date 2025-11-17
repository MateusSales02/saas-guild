import { IsEnum } from 'class-validator';
import { ParticipantStatus } from './participant-status.enum';

export class UpdateParticipantDto {
  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;
}
