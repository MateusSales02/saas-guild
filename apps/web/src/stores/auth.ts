import { reactive } from 'vue'
import axios from 'axios'

export const auth = reactive<{ token: string | null; user: any | null }>({
  token: null,
  user: null,
})

export const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  if (auth.token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

export function setSession(token: string, user: any) {
  auth.token = token
  auth.user = user
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function loadSession() {
  const t = localStorage.getItem('token')
  const u = localStorage.getItem('user')
  if (t && u) {
    auth.token = t
    auth.user = JSON.parse(u)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }
}

export function clearSession() {
  auth.token = null
  auth.user = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.common['Authorization']
}

export const AuthApi = {
  async register(email: string, password: string, nickname: string, role: string) {
    const res = await api.post('/auth/register', { email, password, nickname, role })
    const { token, user } = res.data
    setSession(token, user)
    return res.data
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    setSession(token, user)
    return res.data
  },

  async me() {
    const res = await api.get('/auth/me')
    return res.data
  },
}
