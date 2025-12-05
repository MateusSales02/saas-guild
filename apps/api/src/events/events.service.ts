// apps/api/src/events/events.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';
import { ParticipantsService } from './participants.service';
import { RecurrenceService } from './recurrence.service';
import { Guild } from '../guilds/guild.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Guild)
    private readonly guildRepo: Repository<Guild>,
    private readonly participantsService: ParticipantsService,
    @Inject(forwardRef(() => RecurrenceService))
    private readonly recurrenceService: RecurrenceService,
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

    const savedEvent = await this.eventRepo.save(event);

    // Se o evento é recorrente, gera as primeiras ocorrências
    if (savedEvent.is_recurring) {
      await this.recurrenceService.createNextOccurrences(savedEvent);
    }

    return savedEvent;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    await this.eventRepo.update(id, dto);

    // Se o evento é recorrente e foi atualizado, atualiza as ocorrências futuras
    if (event.is_recurring && !event.parent_event_id) {
      await this.recurrenceService.updateFutureOccurrences(
        id,
        dto as Partial<Event>,
      );
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const event = await this.findOne(id);

    // Se o evento é recorrente, deleta também as ocorrências futuras
    if (event.is_recurring && !event.parent_event_id) {
      await this.recurrenceService.deleteFutureOccurrences(id);
    }

    return this.eventRepo.softRemove(event);
  }

  async findDeleted() {
    return this.eventRepo
      .find({
        where: {},
        withDeleted: true,
        relations: ['participants', 'participants.user', 'guild'],
      })
      .then((events) => events.filter((e) => e.deleted_at !== null));
  }

  async restore(id: number) {
    await this.eventRepo.restore(id);
    return { restored: true };
  }

  async hardRemove(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    await this.eventRepo.remove(event);
    return { deleted: true };
  }

  async updateParticipantStatus(
    eventId: number,
    memberId: number,
    dto: UpdateParticipantStatusDto,
  ) {
    return this.participantsService.update(eventId, memberId, dto);
  }
}
