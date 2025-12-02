/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
                  @typescript-eslint/no-unsafe-argument */

import axios from 'axios'
import { auth, setSession } from '@/stores/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'http://54.161.67.120:3000' : 'http://localhost:3000')

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  if (auth?.token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

export const AuthApi = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const { token, user, guild } = res.data
    setSession(token, user, guild)
    return res.data
  },

  // registro público -> sempre cria LEADER no backend
  async register(email: string, password: string, nickname: string) {
    const res = await api.post('/auth/register', { email, password, nickname })
    const { token, user, guild } = res.data
    setSession(token, user, guild)
    return res.data
  },

  // criar jogador "player" (para usar em Members.vue)
  async createPlayer(email: string, password: string, nickname: string) {
    const res = await api.post('/auth/players', { email, password, nickname })
    // NÃO faz login, nem chama setSession
    return res.data
  },

  me() {
    return api.get('/auth/me').then((r) => r.data)
  },
}

export async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await api.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
  })
  return res.data
}

export const GuildsApi = {
  list() {
    return api.get('/guilds').then((r) => r.data)
  },
  create(name: string) {
    return api.post('/guilds', { name }).then((r) => r.data)
  },
  get(id: number) {
    return api.get(`/guilds/${id}`).then((r) => r.data)
  },
  update(id: number, name: string) {
    return api.put(`/guilds/${id}`, { name }).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/guilds/${id}`).then((r) => r.data)
  },
}

export const MembersApi = {
  listByGuild(guildId: number) {
    return api.get('/guild-members', { params: { guildId } }).then((r) => r.data)
  },
  add(userId: number, guildId: number, role: 'member' | 'leader' | 'officer') {
    return api.post('/guild-members', { userId, guildId, role }).then((r) => r.data)
  },
  update(id: number, role: 'member' | 'leader' | 'officer') {
    return api.put(`/guild-members/${id}`, { role }).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/guild-members/${id}`).then((r) => r.data)
  },
}

export const EventsApi = {
  listByGuild(guildId: number) {
    return api.get('/events', { params: { guildId } }).then((r) => r.data)
  },
  create(payload: {
    title: string
    description: string
    date: string
    type: 'RAID' | 'GATHERING' | 'DUNGEON' | 'PVP'
    location?: string
    guildId: number
  }) {
    return api.post('/events', payload).then((r) => r.data)
  },
  rsvp(eventId: number, userId: number, status: 'confirmed' | 'declined' | 'pending') {
    return api.post(`/events/${eventId}/participants`, { userId, status }).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/events/${id}`).then((r) => r.data)
  },
}

export type FinanceTxPayload = {
  guildId: number
  type: 'in' | 'out'
  amount: number
  note?: string
}

export const FinanceApi = {
  listByGuild(guildId: number) {
    return api.get('/finance-transactions', { params: { guildId } }).then((r) => r.data)
  },

  create(payload: FinanceTxPayload) {
    return api.post('/finance-transactions', payload).then((r) => r.data)
  },

  remove(id: number) {
    return api.delete(`/finance-transactions/${id}`).then((r) => r.data)
  },

  summary(guildId: number) {
    return api.get('/finance-transactions/summary', { params: { guildId } }).then((r) => r.data)
  },
}

export const BuildClassesApi = {
  list() {
    return api.get('/build-classes').then((r) => r.data)
  },
}

export const BuildSpecsApi = {
  list(classId?: number) {
    const params = classId ? { classId } : undefined
    return api.get('/build-specs', { params }).then((r) => r.data)
  },
}

export const BuildItemsApi = {
  list() {
    return api.get('/build-items').then((r) => r.data)
  },
}

export type BuildPayload = {
  name: string
  description?: string
  role?: string
  classId: number
  specId?: number
  itemIds?: number[]
  guildId?: number
  authorId?: number
  memberId?: number
  is_public?: boolean
}

export const BuildsApi = {
  list(params?: Partial<BuildPayload> & { search?: string }) {
    return api.get('/builds', { params }).then((r) => r.data)
  },
  get(id: number) {
    return api.get(`/builds/${id}`).then((r) => r.data)
  },
  create(payload: BuildPayload) {
    return api.post('/builds', payload).then((r) => r.data)
  },
  update(id: number, payload: Partial<BuildPayload>) {
    return api.put(`/builds/${id}`, payload).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/builds/${id}`).then((r) => r.data)
  },
}

export const IntegrationsApi = {
  albionStatus() {
    return api.get('/integrations/albion').then((r) => r.data)
  },

  refreshAlbion() {
    return api.post('/integrations/albion/refresh').then((r) => r.data)
  },

  sendDiscord(message: string) {
    return api.post('/integrations/notify', { message }).then((r) => r.data)
  },

  lastNotification() {
    return api.get('/integrations/notify/last').then((r) => r.data)
  },
}

// Albion Online Data API
// Documentação: https://www.albion-online-data.com/api-site/api.html
const ALBION_DATA_API = 'https://www.albion-online-data.com/api/v2/stats'

export interface AlbionPriceData {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_min_date: string
  sell_price_max: number
  sell_price_max_date: string
  buy_price_min: number
  buy_price_min_date: string
  buy_price_max: number
  buy_price_max_date: string
}

export interface AlbionHistoryData {
  item_id: string
  location: string
  quality: number
  data: Array<{
    timestamp: string
    avg_price: number
    item_count: number
  }>
}

export const AlbionDataApi = {
  /**
   * Obtém preços atuais de itens no mercado
   * @param items - Lista de IDs de itens (ex: ['T4_BAG', 'T5_BAG'])
   * @param locations - Lista de cidades (ex: ['Caerleon', 'Bridgewatch'])
   * @param qualities - Lista de qualidades (0-5, onde 0=normal, 1=good, 2=outstanding, etc)
   */
  async getPrices(
    items: string[],
    locations?: string[],
    qualities?: number[],
  ): Promise<AlbionPriceData[]> {
    const itemsParam = items.join(',')
    const params = new URLSearchParams()

    if (locations && locations.length > 0) {
      params.append('locations', locations.join(','))
    }
    if (qualities && qualities.length > 0) {
      params.append('qualities', qualities.join(','))
    }

    const url = `${ALBION_DATA_API}/prices/${itemsParam}.json${params.toString() ? '?' + params.toString() : ''}`
    const response = await axios.get<AlbionPriceData[]>(url)
    return response.data
  },

  /**
   * Obtém histórico de preços de itens
   * @param items - Lista de IDs de itens
   * @param options - Opções de filtro (date, end_date, locations, qualities, time-scale)
   */
  async getHistory(
    items: string[],
    options?: {
      date?: string // formato: MM-DD-YYYY
      end_date?: string
      locations?: string[]
      qualities?: number[]
      timeScale?: number // 1=hourly, 6=6hours, 24=daily
    },
  ): Promise<AlbionHistoryData[]> {
    const itemsParam = items.join(',')
    const params = new URLSearchParams()

    if (options?.date) params.append('date', options.date)
    if (options?.end_date) params.append('end_date', options.end_date)
    if (options?.locations && options.locations.length > 0) {
      params.append('locations', options.locations.join(','))
    }
    if (options?.qualities && options.qualities.length > 0) {
      params.append('qualities', options.qualities.join(','))
    }
    if (options?.timeScale) {
      params.append('time-scale', options.timeScale.toString())
    }

    const url = `${ALBION_DATA_API}/history/${itemsParam}.json${params.toString() ? '?' + params.toString() : ''}`
    const response = await axios.get<AlbionHistoryData[]>(url)
    return response.data
  },

  /**
   * Obtém dados de gráfico para visualização
   */
  async getCharts(
    items: string[],
    options?: {
      date?: string
      end_date?: string
      locations?: string[]
      qualities?: number[]
      timeScale?: number
    },
  ) {
    const itemsParam = items.join(',')
    const params = new URLSearchParams()

    if (options?.date) params.append('date', options.date)
    if (options?.end_date) params.append('end_date', options.end_date)
    if (options?.locations && options.locations.length > 0) {
      params.append('locations', options.locations.join(','))
    }
    if (options?.qualities && options.qualities.length > 0) {
      params.append('qualities', options.qualities.join(','))
    }
    if (options?.timeScale) {
      params.append('time-scale', options.timeScale.toString())
    }

    const url = `${ALBION_DATA_API}/charts/${itemsParam}.json${params.toString() ? '?' + params.toString() : ''}`
    const response = await axios.get(url)
    return response.data
  },
}
