import { reactive } from 'vue';
export const auth = reactive<{ token: string | null; user: any | null }>({ token: null, user: null });
export function setSession(token: string, user: any) {
  auth.token = token; auth.user = user;
  localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
}
export function loadSession() {
  const t = localStorage.getItem('token'); const u = localStorage.getItem('user');
  if (t && u) { auth.token = t; auth.user = JSON.parse(u); }
}
export function clearSession() {
  auth.token = null; auth.user = null; localStorage.removeItem('token'); localStorage.removeItem('user');
}
