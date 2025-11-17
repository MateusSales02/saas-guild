// apps/api/src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { Guild } from '../guilds/guild.entity';
import { EventParticipant } from './event-participant.entity';
import { User } from '../users/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>,
    @InjectRepository(Guild)
    private readonly guildsRepo: Repository<Guild>,
    @InjectRepository(EventParticipant)
    private readonly partsRepo: Repository<EventParticipant>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // ===== LISTAGENS =====

  // usado pelo controller: GET /events
  async findAll(): Promise<Event[]> {
    return this.eventsRepo.find({
      order: { event_date: 'ASC' },
      relations: ['guild', 'participants', 'participants.user'],
    });
  }

  // usado se quiser listar por guild específica
  async listByGuild(guildId: number): Promise<Event[]> {
    return this.eventsRepo.find({
      where: { guild: { id: guildId } },
      order: { event_date: 'ASC' },
      relations: ['guild', 'participants', 'participants.user'],
    });
  }

  async findOne(id: number): Promise<Event | null> {
    const ev = await this.eventsRepo.findOne({
      where: { id },
      relations: ['guild', 'participants', 'participants.user'],
    });
    return ev ?? null;
  }

  async create(data: {
    guildId: number;
    name: string;
    description?: string;
    event_date: string;
    recurring?: boolean;
  }): Promise<Event> {
    const guild = await this.guildsRepo.findOne({
      where: { id: data.guildId },
    });
    if (!guild) {
      throw new NotFoundException('Guild não encontrada');
    }

    const event = this.eventsRepo.create({
      guild,
      name: data.name,
      description: data.description,
      event_date: new Date(data.event_date),
      recurring: !!data.recurring,
    });

    return this.eventsRepo.save(event);
  }

  async update(id: number, data: Partial<Event>): Promise<Event | null> {
    await this.eventsRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.eventsRepo.delete(id);
  }

  async rsvp(
    eventId: number,
    userId: number,
    status: 'confirmed' | 'declined' | 'pending',
  ): Promise<Event | null> {
    const ev = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!ev) {
      throw new NotFoundException('Evento não encontrado');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let part = await this.partsRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });

    if (!part) {
      part = this.partsRepo.create({ event: ev, user, status });
    } else {
      part.status = status;
    }

    await this.partsRepo.save(part);

    return this.findOne(eventId);
  }
}
