import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Guild } from './guild.entity';
import { GuildMember } from './guild-member.entity'; // caminho correto (mesma pasta)
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, GuildMember])],
  controllers: [GuildsController],
  providers: [GuildsService],
  exports: [GuildsService],
})
export class GuildsModule {}
