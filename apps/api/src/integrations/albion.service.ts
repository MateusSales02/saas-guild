import { Injectable, Logger } from '@nestjs/common'

export type AlbionServerStatus = {
  server: string
  status: string
  message?: string
  population?: number
}

export type AlbionActivity = {
  EventId: number
  EventTime: string
  KillerGuildName?: string
  VictimGuildName?: string
  TotalVictimKillFame?: number
}

@Injectable()
export class AlbionService {
  private readonly statusUrl =
    process.env.ALBION_STATUS_URL ?? 'https://gameinfo.albiononline.com/api/gameinfo/servers/status'
  private readonly activitiesUrl =
    process.env.ALBION_ACTIVITIES_URL ?? 'https://gameinfo.albiononline.com/api/gameinfo/events'
  private readonly logger = new Logger(AlbionService.name)

  async fetchStatus(): Promise<AlbionServerStatus[]> {
    const res = await fetch(this.statusUrl)
    if (!res.ok) {
      this.logger.warn(`Falha ao consultar status do Albion: ${res.status}`)
      throw new Error('Não foi possível consultar o status do Albion')
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }

  async fetchActivities(limit = 5): Promise<AlbionActivity[]> {
    const url = `${this.activitiesUrl}?limit=${limit}&offset=0`
    const res = await fetch(url)
    if (!res.ok) {
      this.logger.warn(`Falha ao consultar atividades do Albion: ${res.status}`)
      throw new Error('Não foi possível consultar atividades do Albion')
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  }
}
