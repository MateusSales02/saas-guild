// apps/api/src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';
import { ParticipantsService } from './participants.service';
import { Guild } from '../guilds/guild.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Guild)
    private readonly guildRepo: Repository<Guild>,
    private readonly participantsService: ParticipantsService,
  ) {}

  async findAll(guildId?: number) {
    const where = guildId ? { guild: { id: guildId } } : {};
    return this.eventRepo.find({
      where,
      relations: ['participants', 'participants.user', 'guild'],
      order: { date: 'ASC' as const },
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['participants', 'participants.user', 'guild'],
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    return event;
  }

  async create(dto: CreateEventDto, guildId: number) {
    const guild = await this.guildRepo.findOne({ where: { id: guildId } });
    if (!guild) {
      throw new NotFoundException('Guilda não encontrada');
    }

    const event = this.eventRepo.create({
      ...dto,
      guild,
    });
    return this.eventRepo.save(event);
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.eventRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const exists = await this.findOne(id);
    return this.eventRepo.softRemove(exists);
  }

  async updateParticipantStatus(
    eventId: number,
    memberId: number,
    dto: UpdateParticipantStatusDto,
  ) {
    return this.participantsService.update(eventId, memberId, dto);
  }
}
