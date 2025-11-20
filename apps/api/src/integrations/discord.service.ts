import { Injectable, Logger } from '@nestjs/common'

export type DiscordNotificationResult = {
  ok: boolean
  message: string
  sentAt: string
}

@Injectable()
export class DiscordService {
  private readonly webhookUrl = process.env.DISCORD_WEBHOOK_URL
  private readonly logger = new Logger(DiscordService.name)

  async sendWebhook(content: string): Promise<DiscordNotificationResult> {
    if (!this.webhookUrl) {
      this.logger.warn('DISCORD_WEBHOOK_URL não configurada; notificação ignorada')
      return { ok: false, message: 'Webhook não configurada', sentAt: new Date().toISOString() }
    }

    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (!res.ok) {
      this.logger.warn(`Falha ao enviar webhook do Discord: ${res.status}`)
      throw new Error('Não foi possível enviar a notificação ao Discord')
    }

    return { ok: true, message: content, sentAt: new Date().toISOString() }
  }
}
