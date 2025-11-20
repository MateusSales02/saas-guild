import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // GET /events
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // GET /events/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // POST /events
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  // PATCH /events/:id
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  // DELETE /events/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }

  // PATCH /events/:eventId/participants/:memberId/status
  @Patch(':eventId/participants/:memberId/status')
  updateParticipantStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateParticipantStatusDto,
  ) {
    return this.eventsService.updateParticipantStatus(eventId, memberId, dto);
  }
}
