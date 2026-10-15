<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import AuthShell from '@/components/ui/AuthShell.vue'
import { api } from '@/lib/api'
import { friendlyError } from '@/lib/errors'

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

// Aviso em tempo real, antes de enviar
const mismatch = computed(() => !!confirmPassword.value && confirmPassword.value !== password.value)

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
    await api.post('/auth/reset-password', { token: token.value, newPassword: password.value })
    success.value = true
  } catch (e: any) {
    error.value = friendlyError(e, 'Erro ao redefinir senha')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <button type="button" class="btn btn-ghost btn-sm -ml-3 mb-8" @click="goToLogin">
      <AppIcon name="arrow-left" :size="15" />
      Voltar para Login
    </button>

    <!-- Sucesso -->
    <div v-if="success">
      <span class="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
        <AppIcon name="check" :size="20" />
      </span>
      <h1 class="mt-5 font-display text-3xl font-semibold tracking-wide text-slate-50">Senha Alterada!</h1>
      <p class="mt-3 text-sm leading-relaxed text-slate-400">
        Sua senha foi alterada com sucesso! Você já pode fazer login com sua nova senha.
      </p>
      <button type="button" class="btn btn-primary mt-8 !h-11 w-full" @click="goToLogin">Voltar para Login</button>
    </div>

    <!-- Formulário -->
    <div v-else>
      <p class="eyebrow">Acesso</p>
      <h1 class="mt-2 font-display text-3xl font-semibold tracking-wide text-slate-50">Redefina sua Senha</h1>
      <p class="mt-2 text-sm text-slate-400">Digite sua nova senha abaixo</p>

      <div v-if="error" role="alert" class="alert alert-error mt-6">
        <AppIcon name="alert" :size="16" class="mt-0.5" />
        <span>{{ error }}</span>
      </div>

      <form class="mt-8 space-y-4" @submit.prevent="resetPassword">
        <div>
          <label for="password" class="label">Nova senha</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Digite sua nova senha"
              class="input !h-11 !pr-11"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:text-slate-200"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showPassword = !showPassword"
            >
              <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
            </button>
          </div>
          <p class="mt-1.5 text-xs text-slate-500">Mínimo de 6 caracteres</p>
        </div>

        <div>
          <label for="confirmPassword" class="label">Confirmar nova senha</label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Confirme sua nova senha"
              class="input !h-11 !pr-11"
              :class="{ '!border-rose-500/50': mismatch }"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:text-slate-200"
              :aria-label="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <AppIcon :name="showConfirmPassword ? 'eye-off' : 'eye'" :size="16" />
            </button>
          </div>
          <p v-if="mismatch" class="mt-1.5 text-xs text-rose-300">As senhas ainda não são iguais</p>
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary !h-11 w-full">
          <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
          {{ loading ? 'Alterando...' : 'Alterar senha' }}
        </button>
      </form>
    </div>
  </AuthShell>
</template>
