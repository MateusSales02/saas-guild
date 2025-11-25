<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { AuthApi } from '@/lib/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const nickname = ref('')
const loading = ref(false)
const error = ref('')

function goToHome() {
  console.log('goToHome chamado - navegando para /')
  router.push('/')
}

async function register() {
  error.value = ''
  loading.value = true
  try {
    await AuthApi.register(email.value, password.value, nickname.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Falha no registro'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
    <!-- Background Effects -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C6A95D]/10 rounded-full blur-3xl animate-pulse" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJWMTh6TTI4IDE4djE2aDJ2LTJoLTJ6bTAgMnYyaDJWMjB6bTAgNnYyaDJ2LTJ6bTAtNnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
    </div>

    <!-- Register Card -->
    <div class="relative w-full max-w-md mx-4 animate-fade-in-up">
      <!-- Back to Home Button -->
      <button
        @click="goToHome"
        type="button"
        style="cursor: pointer;"
        class="relative z-10 inline-flex items-center gap-2 text-slate-400 hover:text-[#C6A95D] transition-colors mb-6 group"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="font-medium">Voltar ao Início</span>
      </button>

      <!-- Glow Effect -->
      <div class="absolute -inset-4 bg-gradient-to-r from-[#C6A95D]/20 via-indigo-500/20 to-[#C6A95D]/20 rounded-3xl blur-3xl opacity-50 pointer-events-none" />

      <!-- Card Content -->
      <div class="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-[#C6A95D] to-amber-500 grid place-items-center shadow-lg shadow-[#C6A95D]/30">
            <svg class="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl font-black text-center mb-2">
          <span class="bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent">
            Criar Guild
          </span>
        </h1>
        <p class="text-center text-slate-400 mb-8">Comece sua jornada épica agora</p>

        <!-- Form -->
        <form @submit.prevent="register" class="space-y-5">
          <!-- Email Input -->
          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">E-mail</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">Senha</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            />
          </div>

          <!-- Nickname Input -->
          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">Nome da Guild</label>
            <input
              v-model="nickname"
              type="text"
              required
              placeholder="Ex: Cavaleiros do Apocalipse"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- Info Box -->
          <div class="flex items-start gap-2 p-3 rounded-xl bg-[#C6A95D]/10 border border-[#C6A95D]/30 text-[#C6A95D] text-sm">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <span>Você será o líder da guild automaticamente</span>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="loading || !email || !password || !nickname"
            class="group relative w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-lg shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span class="relative z-10">{{ loading ? 'Criando Guild...' : 'Criar Guild Agora' }}</span>
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-[#C6A95D] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-slate-900 text-slate-400">Já tem uma conta?</span>
            </div>
          </div>

          <!-- Login Link -->
          <RouterLink
            to="/login"
            class="block w-full px-6 py-4 rounded-xl border-2 border-[#C6A95D]/50 bg-slate-800/30 text-slate-100 font-semibold text-center hover:border-[#C6A95D] hover:bg-slate-800/50 hover:scale-[1.02] transition-all duration-300"
          >
            Fazer Login
          </RouterLink>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out;
}
</style>
