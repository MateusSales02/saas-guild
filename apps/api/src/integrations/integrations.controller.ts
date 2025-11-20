import { Body, Controller, Get, Post } from '@nestjs/common'
import { IntegrationsService } from './integrations.service'

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('albion')
  getAlbionStatus() {
    return this.integrationsService.getAlbionSnapshot()
  }

  @Post('albion/refresh')
  refreshAlbion() {
    return this.integrationsService.refreshAlbion()
  }

  @Post('notify')
  sendDiscord(@Body('message') message: string) {
    return this.integrationsService.notifyDiscord(message ?? 'Atualização da guilda')
  }

  @Get('notify/last')
  lastNotification() {
    return this.integrationsService.getLastDiscordNotification()
  }
}
