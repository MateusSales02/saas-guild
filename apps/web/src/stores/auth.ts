import { reactive } from 'vue'

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

export const auth = reactive<AuthState>({
  token: null,
  user: null,
  guild: null,
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
}

/**
 * Verifica se o usuário tem acesso aos logs de auditoria
 * Apenas emails autorizados podem acessar
 */
export function hasAuditAccess(): boolean {
  const allowedEmails = ['teste@gmail.com', 'salesmateus463@gmail.com']

  return auth.user ? allowedEmails.includes(auth.user.email) : false
}
