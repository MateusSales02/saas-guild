import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Event } from '../events/event.entity';
import { EventParticipant } from '../events/event-participant.entity';
import { FinanceTransaction } from '../finance/finance-transaction.entity';
import { GuildMember } from '../guilds/guild-member.entity';
import { Guild } from '../guilds/guild.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventParticipant,
      FinanceTransaction,
      GuildMember,
      Guild,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
