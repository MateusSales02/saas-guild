// apps/api/src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';
import { ParticipantsService } from './participants.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly participantsService: ParticipantsService,
  ) {}

  async findAll() {
    return this.eventRepo.find({
      relations: ['participants', 'participants.member'],
      order: { event_date: 'ASC' as const },
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['participants', 'participants.member'],
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    return event;
  }

  async create(dto: CreateEventDto) {
    const event = this.eventRepo.create(dto);
    return this.eventRepo.save(event);
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.eventRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const exists = await this.findOne(id);
    return this.eventRepo.remove(exists);
  }

  async updateParticipantStatus(
    eventId: number,
    memberId: number,
    dto: UpdateParticipantStatusDto,
  ) {
    return this.participantsService.update(eventId, memberId, dto);
  }
}
