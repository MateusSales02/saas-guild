/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-return,
                  @typescript-eslint/no-unsafe-argument */

import axios from 'axios'
import { auth, setSession } from '@/stores/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'https://54.161.67.120:3000' : 'http://localhost:3000')

console.log('🔧 [API CONFIG] VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('🔧 [API CONFIG] import.meta.env.PROD:', import.meta.env.PROD)
console.log('🔧 [API CONFIG] Final API_BASE_URL:', API_BASE_URL)

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
})

api.interceptors.request.use((config) => {
  if (auth?.token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  // Force no cache headers on every request
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  config.headers.Pragma = 'no-cache'
  config.headers.Expires = '0'
  // Note: We don't add _t parameter globally to avoid breaking endpoints that validate query params
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

  dailyHistory(guildId: number, days: number) {
    return api
      .get<Array<{ date: string; balance: number }>>('/finance-transactions/daily-history', {
        params: { guildId, days },
      })
      .then((r) => r.data)
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

export type OperationCategory = 'flip' | 'craft' | 'refine' | 'transport' | 'gathering' | 'other'
export type OperationStatus = 'open' | 'sold' | 'cancelled'
export type EntryKind = 'purchase' | 'fee' | 'sale'

export type OperationEntry = {
  id: number
  kind: EntryKind
  /** valor bruto da venda */
  amount: number
  /** taxa do mercado descontada (só vendas) */
  tax: number
  quantity: number | null
  note: string | null
  occurred_at: string
  tx_id: number | null
  created_by_name: string | null
}

export type FinanceOperation = {
  id: number
  title: string
  category: OperationCategory
  quantity: number
  cost: number
  fees: number
  /** taxa do mercado em % */
  fee_rate: number
  market_tax: number
  expected_revenue: number
  actual_revenue: number | null
  status: OperationStatus
  purchased_at: string
  sold_at: string | null
  note: string | null
  created_by_name: string | null
  sold_quantity: number
  entries?: OperationEntry[]
  total_cost: number
  received: number
  balance: number
  expected_net: number
  expected_profit: number
  actual_profit: number | null
  variance: number | null
}

export type OperationsSummary = {
  counts: { total: number; open: number; sold: number; cancelled: number }
  invested: number
  openCapital: number
  openReceived: number
  openExpectedProfit: number
  expectedProfit: number
  closedExpectedProfit: number
  realizedRevenue: number
  realizedProfit: number
  accuracy: number | null
  roi: number | null
  winRate: number | null
  byCategory: Array<{
    category: OperationCategory
    count: number
    invested: number
    expectedProfit: number
    realizedProfit: number
  }>
  monthly: Array<{ month: string; expectedProfit: number; realizedProfit: number; count: number }>
}

export type OperationPayload = {
  guildId: number
  title: string
  category?: OperationCategory
  quantity?: number
  cost: number
  feeRate?: number
  expectedRevenue: number
  purchasedAt?: string
  note?: string
  syncTreasury?: boolean
}

export type OperationUpdate = Partial<
  Pick<
    OperationPayload,
    'title' | 'category' | 'quantity' | 'expectedRevenue' | 'feeRate' | 'purchasedAt' | 'note'
  >
>

export type EntryPayload = {
  kind: EntryKind
  amount: number
  quantity?: number
  note?: string
  occurredAt?: string
  syncTreasury?: boolean
}

export const OperationsApi = {
  listByGuild(guildId: number): Promise<FinanceOperation[]> {
    return api.get('/finance-operations', { params: { guildId } }).then((r) => r.data)
  },
  summary(guildId: number): Promise<OperationsSummary> {
    return api.get('/finance-operations/summary', { params: { guildId } }).then((r) => r.data)
  },
  create(payload: OperationPayload): Promise<FinanceOperation> {
    return api.post('/finance-operations', payload).then((r) => r.data)
  },
  update(id: number, payload: OperationUpdate): Promise<FinanceOperation> {
    return api.patch(`/finance-operations/${id}`, payload).then((r) => r.data)
  },
  addEntry(id: number, payload: EntryPayload): Promise<FinanceOperation> {
    return api.post(`/finance-operations/${id}/entries`, payload).then((r) => r.data)
  },
  removeEntry(id: number, entryId: number): Promise<FinanceOperation> {
    return api.delete(`/finance-operations/${id}/entries/${entryId}`).then((r) => r.data)
  },
  close(id: number, result: 'sold' | 'cancelled'): Promise<FinanceOperation> {
    return api.post(`/finance-operations/${id}/close`, { result }).then((r) => r.data)
  },
  reopen(id: number): Promise<FinanceOperation> {
    return api.post(`/finance-operations/${id}/reopen`).then((r) => r.data)
  },
  remove(id: number) {
    return api.delete(`/finance-operations/${id}`).then((r) => r.data)
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
  classId?: number
  specId?: number
  itemIds?: number[]
  guildId?: number
  authorId?: number
  memberId?: number
  is_public?: boolean
  price?: number
  category?: string
  tags?: string[]
  loadout?: Record<string, unknown>
  author_name?: string
  videos?: string[]
  status?: 'draft' | 'published'
}

export type BuildFilters = {
  search?: string
  guildId?: number
  authorId?: number
  voterId?: number
  category?: string
  sort?: 'popular' | 'name' | 'recent'
}

export const BuildsApi = {
  list(params?: BuildFilters) {
    return api.get('/builds', { params }).then((r) => r.data)
  },
  vote(id: number): Promise<{ voted: boolean; vote_count: number }> {
    return api.post(`/builds/${id}/vote`).then((r) => r.data)
  },
  myVotes(): Promise<number[]> {
    return api.get('/builds/votes/mine').then((r) => r.data)
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

export type AlbionRegion = 'west' | 'europe' | 'east'

const ALBION_REGION_HOSTS: Record<AlbionRegion, string> = {
  west: 'https://west.albion-online-data.com/api/v2/stats',
  europe: 'https://europe.albion-online-data.com/api/v2/stats',
  east: 'https://east.albion-online-data.com/api/v2/stats',
}

function albionBaseUrl(region?: AlbionRegion): string {
  return region ? ALBION_REGION_HOSTS[region] : ALBION_DATA_API
}

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
    region?: AlbionRegion,
  ): Promise<AlbionPriceData[]> {
    const itemsParam = items.join(',')
    const params = new URLSearchParams()

    if (locations && locations.length > 0) {
      params.append('locations', locations.join(','))
    }
    if (qualities && qualities.length > 0) {
      params.append('qualities', qualities.join(','))
    }

    const url = `${albionBaseUrl(region)}/prices/${itemsParam}.json${params.toString() ? '?' + params.toString() : ''}`
    const response = await axios.get<AlbionPriceData[]>(url)
    return response.data
  },

  /**
   * Busca preços de muitos itens dividindo em lotes (a URL tem limite de tamanho).
   * Os lotes são sequenciais para respeitar o limite de requisições da API.
   */
  async getPricesBatch(
    items: string[],
    locations?: string[],
    qualities?: number[],
    region?: AlbionRegion,
    options: { chunkSize?: number; onProgress?: (done: number, total: number) => void } = {},
  ): Promise<AlbionPriceData[]> {
    const chunkSize = options.chunkSize ?? 100
    const unique = [...new Set(items)]
    const total = Math.ceil(unique.length / chunkSize)
    const results: AlbionPriceData[] = []
    for (let i = 0; i < unique.length; i += chunkSize) {
      results.push(
        ...(await this.getPrices(unique.slice(i, i + chunkSize), locations, qualities, region)),
      )
      options.onProgress?.(i / chunkSize + 1, total)
    }
    return results
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
      region?: AlbionRegion
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

    const url = `${albionBaseUrl(options?.region)}/history/${itemsParam}.json${params.toString() ? '?' + params.toString() : ''}`
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
