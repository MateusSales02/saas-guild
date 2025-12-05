import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { RecurrenceService } from './recurrence.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly recurrenceService: RecurrenceService,
  ) {}

  // GET /events?guildId=123
  @Get()
  findAll(
    @Query('guildId', new ParseIntPipe({ optional: true })) guildId?: number,
  ) {
    return this.eventsService.findAll(guildId);
  }

  // GET /events/deleted/list
  @Get('deleted/list')
  findDeleted() {
    return this.eventsService.findDeleted();
  }

  // GET /events/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  // POST /events
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto, dto.guildId);
  }

  // PATCH /events/:id
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  // PATCH /events/:id/restore
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.restore(id);
  }

  // DELETE /events/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }

  // DELETE /events/:id/hard
  @Delete(':id/hard')
  hardRemove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.hardRemove(id);
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

  // POST /events/:id/generate-occurrences
  @ApiOperation({
    summary: 'Gerar manualmente ocorrências de evento recorrente',
  })
  @ApiResponse({
    status: 200,
    description: 'Ocorrências geradas com sucesso',
  })
  @Post(':id/generate-occurrences')
  async generateOccurrences(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.findOne(id);
    const count = await this.recurrenceService.createNextOccurrences(event);
    return {
      message: `${count} ocorrências criadas com sucesso`,
      count,
    };
  }

  // DELETE /events/:id/future-occurrences
  @ApiOperation({
    summary: 'Deletar ocorrências futuras de evento recorrente',
  })
  @ApiResponse({
    status: 200,
    description: 'Ocorrências futuras deletadas',
  })
  @Delete(':id/future-occurrences')
  async deleteFutureOccurrences(@Param('id', ParseIntPipe) id: number) {
    const count = await this.recurrenceService.deleteFutureOccurrences(id);
    return {
      message: `${count} ocorrências futuras deletadas`,
      count,
    };
  }
}
