// apps/api/src/events/participants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventParticipant } from './event-participant.entity';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(EventParticipant)
    private participantsRepo: Repository<EventParticipant>,

    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(
    eventId: number,
    dto: CreateParticipantDto,
  ): Promise<EventParticipant> {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event) throw new NotFoundException(`Evento ${eventId} não encontrado`);

    const user = await this.usersRepo.findOneBy({ id: dto.userId });
    if (!user)
      throw new NotFoundException(`Usuário ${dto.userId} não encontrado`);

    const participant = this.participantsRepo.create({
      event,
      user,
      status: dto.status || 'pending',
    });

    return this.participantsRepo.save(participant);
  }

  async findAll(eventId: number): Promise<EventParticipant[]> {
    return this.participantsRepo.find({
      where: { event: { id: eventId } },
      relations: ['user'],
    });
  }

  async update(
    eventId: number,
    userId: number,
    dto: UpdateParticipantStatusDto,
  ): Promise<EventParticipant> {
    const participant = await this.participantsRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
      relations: ['event', 'user'],
    });

    if (!participant) {
      throw new NotFoundException(
        `Participante não encontrado para user ${userId} no evento ${eventId}`,
      );
    }

    participant.status = dto.status;
    return this.participantsRepo.save(participant);
  }

  async remove(eventId: number, userId: number) {
    const participant = await this.participantsRepo.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
    });

    if (!participant) {
      throw new NotFoundException(`Participante não encontrado`);
    }

    return this.participantsRepo.remove(participant);
  }
}
