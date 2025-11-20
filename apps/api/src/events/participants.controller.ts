import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';

@Controller('events/:eventId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  create(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CreateParticipantDto,
  ) {
    return this.participantsService.create(eventId, dto);
  }

  @Get()
  findAll(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.participantsService.findAll(eventId);
  }

  @Patch(':memberId')
  updateParticipant(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateParticipantStatusDto,
  ) {
    return this.participantsService.update(eventId, memberId, dto);
  }

  @Delete(':userId')
  remove(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.participantsService.remove(eventId, userId);
  }
}
