import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventParticipant } from './event-participant.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { User } from '../users/user.entity';
import { Guild } from '../guilds/guild.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventParticipant, User, Guild])],
  providers: [EventsService, ParticipantsService],
  controllers: [EventsController, ParticipantsController],
  exports: [EventsService],
})
export class EventsModule {}
