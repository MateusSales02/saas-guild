import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildMember } from './guild-member.entity';
import { GuildMembersService } from './guild-members.service';
import { GuildMembersController } from './guild-members.controller';
import { User } from '../users/user.entity';
import { Guild } from './guild.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuildMember, User, Guild])],
  providers: [GuildMembersService],
  controllers: [GuildMembersController],
})
export class GuildMembersModule {}
