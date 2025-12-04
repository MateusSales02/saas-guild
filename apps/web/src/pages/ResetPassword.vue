<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
    <div class="w-full max-w-md">
      <!-- Success State -->
      <div v-if="success" class="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/30 shadow-2xl animate-fade-in-up">
        <div class="text-center">
          <div class="mb-6 inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full">
            <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 class="text-3xl font-bold text-white mb-4">Senha Alterada!</h2>

          <div class="bg-slate-700/50 rounded-lg p-6 mb-6">
            <p class="text-slate-300 mb-4">
              Sua senha foi alterada com sucesso! Você já pode fazer login com sua nova senha.
            </p>
          </div>

          <button
            @click="goToLogin"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Voltar para Login
          </button>
        </div>
      </div>

      <!-- Reset Form -->
      <div v-else class="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 shadow-2xl animate-fade-in-up">
        <!-- Back Button -->
        <button
          @click="goToLogin"
          class="mb-6 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Login
        </button>

        <div class="text-center mb-8">
          <div class="mb-4 inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full">
            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Redefina sua Senha</h2>
          <p class="text-slate-400">Digite sua nova senha abaixo</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-fade-in-up">
          <p class="text-red-400 text-sm flex items-center">
            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ error }}
          </p>
        </div>

        <form @submit.prevent="resetPassword" class="space-y-6">
          <!-- New Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-300 mb-2">
              Nova Senha
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-xs text-slate-400">Mínimo de 6 caracteres</p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-300 mb-2">
              Confirmar Nova Senha
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/lib/api'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const success = ref(false)
const error = ref('')
const token = ref('')

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    error.value = 'Token de recuperação inválido ou não fornecido'
  }
})

function goToLogin() {
  router.push('/login')
}

async function resetPassword() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem'
    return
  }

  if (password.value.length < 6) {
    error.value = 'A senha deve ter no mínimo 6 caracteres'
    return
  }

  if (!token.value) {
    error.value = 'Token de recuperação inválido'
    return
  }

  loading.value = true
  try {
    await api.post('/auth/reset-password', {
      token: token.value,
      newPassword: password.value,
    })
    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erro ao redefinir senha'
  } finally {
    loading.value = false
  }
}
</script>

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
