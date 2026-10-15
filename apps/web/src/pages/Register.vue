<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import AuthShell from '@/components/ui/AuthShell.vue'
import { AuthApi } from '@/lib/api'
import { friendlyError } from '@/lib/errors'

const router = useRouter()
const email = ref('')
const password = ref('')
const nickname = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

/** 0 a 3: tamanho, letras e números/símbolos */
const strength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = p.length >= 6 ? 1 : 0
  if (p.length >= 10) score++
  if (/[a-zA-Z]/.test(p) && /[\d\W]/.test(p)) score++
  return score
})
const STRENGTH = [
  { label: 'Muito curta', bar: 'bg-rose-500' },
  { label: 'Aceitável', bar: 'bg-amber-400' },
  { label: 'Boa', bar: 'bg-gold-400' },
  { label: 'Forte', bar: 'bg-emerald-400' },
]

function goToHome() {
  router.push('/')
}

async function register() {
  error.value = ''
  loading.value = true
  try {
    await AuthApi.register(email.value, password.value, nickname.value)
    router.push('/dashboard')
  } catch (e: any) {
    if (e?.response?.status === 400) {
      error.value = e?.response?.data?.message ?? 'E-mail já cadastrado ou dados inválidos'
    } else if (e?.response?.status === 500) {
      error.value = 'Erro no servidor. Por favor, tente novamente em alguns instantes.'
    } else {
      error.value = friendlyError(e, 'Não foi possível criar a conta.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <button type="button" class="btn btn-ghost btn-sm -ml-3 mb-8" @click="goToHome">
      <AppIcon name="arrow-left" :size="15" />
      Voltar ao Início
    </button>

    <p class="eyebrow">Comece agora</p>
    <h1 class="mt-2 font-display text-3xl font-semibold tracking-wide text-slate-50">Fundar sua guilda</h1>
    <p class="mt-2 text-sm text-slate-400">Crie a conta e organize tudo em poucos minutos.</p>

    <form class="mt-8 space-y-4" @submit.prevent="register">
      <div>
        <label for="register-nickname" class="label">Nome da guilda</label>
        <div class="relative">
          <AppIcon name="shield" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="register-nickname"
            v-model="nickname"
            type="text"
            required
            maxlength="40"
            placeholder="Ex: Cavaleiros do Apocalipse"
            class="input !h-11 !pl-10"
          />
        </div>
      </div>

      <div>
        <label for="register-email" class="label">E-mail</label>
        <div class="relative">
          <AppIcon name="mail" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="register-email" v-model="email" type="email" required autocomplete="email" placeholder="seu@email.com" class="input !h-11 !pl-10" />
        </div>
      </div>

      <div>
        <label for="register-password" class="label">Senha</label>
        <div class="relative">
          <AppIcon name="lock" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="register-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            autocomplete="new-password"
            placeholder="Mínimo 6 caracteres"
            class="input !h-11 !pl-10 !pr-11"
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
        <div v-if="password" class="mt-2 flex items-center gap-3" aria-live="polite">
          <div class="flex flex-1 gap-1">
            <span
              v-for="i in 3"
              :key="i"
              class="h-1 flex-1 rounded-full transition-colors"
              :class="i <= strength ? STRENGTH[strength].bar : 'bg-white/[0.08]'"
            />
          </div>
          <span class="text-[11px] text-slate-500">{{ STRENGTH[strength].label }}</span>
        </div>
      </div>

      <div class="alert alert-info !border-gold-500/25 !bg-gold-500/[0.06] !text-gold-100">
        <AppIcon name="crown" :size="16" class="mt-0.5 text-gold-300" />
        <span>Você será o líder da guild automaticamente</span>
      </div>

      <div v-if="error" role="alert" class="alert alert-error">
        <AppIcon name="alert" :size="16" class="mt-0.5" />
        <span>{{ error }}</span>
      </div>

      <button type="submit" :disabled="loading || !email || !password || !nickname" class="btn btn-primary !h-11 w-full">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
        {{ loading ? 'Criando Guild...' : 'Criar guilda' }}
      </button>
    </form>

    <div class="my-8 flex items-center gap-3 text-xs text-slate-500">
      <span class="h-px flex-1 bg-white/[0.06]" />
      Já tem uma conta?
      <span class="h-px flex-1 bg-white/[0.06]" />
    </div>

    <RouterLink to="/login" class="btn btn-secondary !h-11 w-full">Fazer Login</RouterLink>
  </AuthShell>
</template>
