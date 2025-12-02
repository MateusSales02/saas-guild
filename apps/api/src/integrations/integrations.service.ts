import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  AlbionService,
  AlbionActivity,
  AlbionServerStatus,
} from './albion.service';
import { DiscordService, DiscordNotificationResult } from './discord.service';

export type AlbionSnapshot = {
  servers: AlbionServerStatus[];
  activities: AlbionActivity[];
  lastUpdated: string;
};

@Injectable()
export class IntegrationsService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationsService.name);
  private statusCache: AlbionSnapshot = {
    servers: [],
    activities: [],
    lastUpdated: new Date().toISOString(),
  };
  private lastDiscordNotification?: DiscordNotificationResult;

  constructor(
    private readonly albionService: AlbionService,
    private readonly discordService: DiscordService,
  ) {}

  async onModuleInit() {
    await this.refreshAlbion().catch((err) =>
      this.logger.warn(`Falha inicial ao buscar status: ${err?.message}`),
    );
  }

  getAlbionSnapshot(): AlbionSnapshot {
    return this.statusCache;
  }

  getLastDiscordNotification() {
    return this.lastDiscordNotification;
  }

  async refreshAlbion(): Promise<AlbionSnapshot> {
    const [servers, activities] = await Promise.all([
      this.albionService.fetchStatus(),
      this.albionService.fetchActivities(),
    ]);

    this.statusCache = {
      servers,
      activities,
      lastUpdated: new Date().toISOString(),
    };

    return this.statusCache;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async pollAlbionStatus() {
    try {
      await this.refreshAlbion();
      this.logger.debug('Status do Albion atualizado pelo cron');
    } catch (err) {
      this.logger.warn(`Erro ao atualizar status do Albion: ${err?.message}`);
    }
  }

  async notifyDiscord(content: string) {
    const result = await this.discordService.sendWebhook(content);
    this.lastDiscordNotification = result;
    return result;
  }
}
