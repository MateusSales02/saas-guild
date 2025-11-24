import { reactive } from 'vue'
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

/** Modelo básico do usuário autenticado */
export interface AuthUser {
  id: string
  email: string
  nickname: string
  role: string
  // coloque aqui outros campos que existirem na sua API
  [key: string]: unknown
}

export interface Guild {
  id: number
  name: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  guild: Guild | null
}

interface AuthResponse {
  token: string
  user: AuthUser
  guild?: Guild | null
}

export const auth = reactive<AuthState>({
  token: null,
  user: null,
  guild: null,
})

const API_BASE_URL = import.meta.env.PROD
  ? 'http://54.161.67.120' // produção (nginx servindo o front)
  : 'http://localhost:3000'

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

// Interceptor de request adicionando o Bearer token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

export function setSession(token: string, user: AuthUser, guild?: Guild | null): void {
  auth.token = token
  auth.user = user
  auth.guild = guild || null
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  if (guild) {
    localStorage.setItem('guild', JSON.stringify(guild))
  }

  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as { [key: string]: unknown }

  return (
    typeof obj.email === 'string' &&
    typeof obj.nickname === 'string' &&
    typeof obj.role === 'string'
  )
}

export function loadSession(): void {
  const t = localStorage.getItem('token')
  const u = localStorage.getItem('user')
  const g = localStorage.getItem('guild')

  if (!t || !u) return

  try {
    const parsed = JSON.parse(u) as unknown
    if (isAuthUser(parsed)) {
      auth.token = t
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      auth.user = parsed
      if (g) {
        try {
          auth.guild = JSON.parse(g) as Guild
        } catch {
          auth.guild = null
        }
      }
      api.defaults.headers.common.Authorization = `Bearer ${t}`
    } else {
      clearSession()
    }
  } catch {
    clearSession()
  }
}

export function clearSession(): void {
  auth.token = null
  auth.user = null
  auth.guild = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('guild')
  delete api.defaults.headers.common.Authorization
}

export const AuthApi = {
  async register(email: string, password: string, nickname: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      nickname,
    })
    const { token, user, guild } = res.data
    setSession(token, user, guild)
    return res.data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    const { token, user, guild } = res.data
    setSession(token, user, guild)
    return res.data
  },

  async me(): Promise<AuthUser> {
    const res = await api.get<AuthUser>('/auth/me')
    return res.data
  },
}
