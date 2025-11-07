import axios from 'axios'
import { auth, setSession } from '@/stores/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
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
    const { token, user } = res.data
    setSession(token, user)
    return res.data
  },

  async register(email: string, password: string, nickname: string, role: string) {
    const res = await api.post('/auth/register', { email, password, nickname, role })
    const { token, user } = res.data
    setSession(token, user)
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
  add(userId: number, guildId: number, role: 'membro' | 'líder' | 'oficial') {
    return api.post('/guild-members', { userId, guildId, role }).then((r) => r.data)
  },
  update(id: number, role: 'membro' | 'líder' | 'oficial') {
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
    guildId: number
    name: string
    description?: string
    event_date: string
    recurring: boolean
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

  // se existir no back
  summary(guildId: number) {
    return api.get('/finance-transactions/summary', { params: { guildId } }).then((r) => r.data)
  },
}
