import { IsEnum } from 'class-validator';
import { ParticipantStatus } from './participant-status.enum';

export class UpdateParticipantStatusDto {
  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;
}
