import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ name: string } | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  function login(name: string) { user.value = { name } }
  function logout() { user.value = null; router.push('/login') }
  return { user, isAuthenticated, login, logout }
})
