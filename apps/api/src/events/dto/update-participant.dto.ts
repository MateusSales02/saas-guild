import { IsEnum } from 'class-validator';

export enum ParticipantStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export class UpdateParticipantStatusDto {
  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;
}
