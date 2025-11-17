import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    data: {
      guildId: number;
      name: string;
      description?: string;
      event_date: string;
      recurring?: boolean;
    },
  ): Promise<Event> {
    // repassa a string pro service
    return this.eventsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Event>,
  ): Promise<Event | null> {
    return this.eventsService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.eventsService.remove(Number(id));
    return { deleted: true };
  }
}
