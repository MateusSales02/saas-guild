<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { api } from '@/lib/api'

const router = useRouter()
const email = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

function goToLogin() {
  router.push('/login')
}

async function recoverPassword() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/auth/recover-password', { email: email.value })
    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erro ao solicitar recuperação de senha'
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

    <!-- Recovery Card -->
    <div class="relative w-full max-w-md mx-4 animate-fade-in-up">
      <!-- Back to Login Button -->
      <button
        @click="goToLogin"
        type="button"
        style="cursor: pointer;"
        class="relative z-10 inline-flex items-center gap-2 text-slate-400 hover:text-[#C6A95D] transition-colors mb-6 group"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="font-medium">Voltar para Login</span>
      </button>

      <!-- Glow Effect -->
      <div class="absolute -inset-4 bg-gradient-to-r from-[#C6A95D]/20 via-indigo-500/20 to-[#C6A95D]/20 rounded-3xl blur-3xl opacity-50 pointer-events-none" />

      <!-- Card Content -->
      <div class="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 grid place-items-center shadow-lg shadow-indigo-500/30">
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          </div>
        </div>

        <!-- Success State -->
        <div v-if="success" class="text-center">
          <h1 class="text-3xl sm:text-4xl font-black mb-4">
            <span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Email Enviado!
            </span>
          </h1>
          <div class="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <svg class="w-12 h-12 mx-auto mb-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <p class="text-slate-300 leading-relaxed">
              Se o email <strong class="text-emerald-400">{{ email }}</strong> estiver cadastrado,
              você receberá instruções para redefinir sua senha.
            </p>
          </div>
          <p class="text-sm text-slate-400 mb-6">
            Verifique sua caixa de entrada e spam. O link expira em 1 hora.
          </p>
          <RouterLink
            to="/login"
            class="block w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-lg shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-[1.02] transition-all duration-300"
          >
            Voltar para Login
          </RouterLink>
        </div>

        <!-- Form State -->
        <div v-else>
          <!-- Title -->
          <h1 class="text-3xl sm:text-4xl font-black text-center mb-2">
            <span class="bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent">
              Recuperar Senha
            </span>
          </h1>
          <p class="text-center text-slate-400 mb-8">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>

          <!-- Form -->
          <form @submit.prevent="recoverPassword" class="space-y-5">
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

            <!-- Error Message -->
            <div v-if="error" class="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- Info Message -->
            <div class="flex items-start gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <span>Por segurança, não informamos se o email está cadastrado ou não.</span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-lg shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span class="relative z-10">{{ loading ? 'Enviando...' : 'Enviar Link de Recuperação' }}</span>
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-[#C6A95D] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>

            <!-- Back to Login -->
            <div class="text-center">
              <RouterLink
                to="/login"
                class="text-sm text-slate-400 hover:text-[#C6A95D] transition-colors font-medium"
              >
                Lembrou a senha? Voltar para login
              </RouterLink>
            </div>
          </form>
        </div>
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
