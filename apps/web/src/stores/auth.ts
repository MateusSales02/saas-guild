import { reactive } from 'vue';
import axios from 'axios';

export const auth = reactive<{ token: string | null; user: any | null }>({
  token: null,
  user: null,
});

// Salvar sessão no localStorage
export function setSession(token: string, user: any) {
  auth.token = token;
  auth.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Carregar sessão do localStorage
export function loadSession() {
  const t = localStorage.getItem('token');
  const u = localStorage.getItem('user');
  if (t && u) {
    auth.token = t;
    auth.user = JSON.parse(u);
  }
}

// Limpar sessão
export function clearSession() {
  auth.token = null;
  auth.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Instância do axios com baseURL do backend
const api = axios.create({
  baseURL: 'http://localhost:3000', // Backend NestJS
});

// Se tiver token em memória, coloca no header
api.interceptors.request.use((config) => {
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// API de autenticação
export const AuthApi = {
  async register(email: string, password: string, nickname: string, role: string) {
    const res = await api.post('/auth/register', {
      email,
      password,
      nickname,
      role,
    });
    const { token, user } = res.data;
    setSession(token, user);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    setSession(token, user);
    return res.data;
  },

  async me() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
