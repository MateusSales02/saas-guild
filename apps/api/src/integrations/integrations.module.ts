import { Module } from '@nestjs/common';
import { AlbionService } from './albion.service';
import { DiscordService } from './discord.service';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [],
  providers: [AlbionService, DiscordService, IntegrationsService],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
