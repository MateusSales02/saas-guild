import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Controller('events/:eventId/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  create(@Param('eventId') eventId: string, @Body() dto: CreateParticipantDto) {
    return this.participantsService.create(Number(eventId), dto);
  }

  @Get()
  findAll(@Param('eventId') eventId: string) {
    return this.participantsService.findAll(Number(eventId));
  }

  @Put(':userId')
  update(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateParticipantDto,
  ) {
    return this.participantsService.update(
      Number(eventId),
      Number(userId),
      dto,
    );
  }

  @Delete(':userId')
  remove(@Param('eventId') eventId: string, @Param('userId') userId: string) {
    return this.participantsService.remove(Number(eventId), Number(userId));
  }
}
