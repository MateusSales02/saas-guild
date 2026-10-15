<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import AuthShell from '@/components/ui/AuthShell.vue'
import { AuthApi } from '@/lib/api'
import { friendlyError } from '@/lib/errors'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

function goToHome() {
  router.push('/')
}

async function login() {
  error.value = ''
  loading.value = true
  try {
    await AuthApi.login(email.value, password.value)
    // Volta para a página que o jogador tentou abrir antes do login
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch (e: any) {
    error.value = friendlyError(e, 'Não foi possível entrar. Verifique seus dados.')
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

    <p class="eyebrow">Bem-vindo de volta</p>
    <h1 class="mt-2 font-display text-3xl font-semibold tracking-wide text-slate-50">Entrar na guilda</h1>
    <p class="mt-2 text-sm text-slate-400">Use o e-mail e a senha da sua conta.</p>

    <form class="mt-8 space-y-4" @submit.prevent="login">
      <div>
        <label for="email" class="label">E-mail</label>
        <div class="relative">
          <AppIcon name="mail" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="seu@email.com" class="input !h-11 !pl-10" />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="label">Senha</label>
          <button type="button" class="mb-1.5 text-xs font-medium text-gold-300 hover:text-gold-200" @click="$router.push('/recuperar-senha')">
            Esqueceu sua senha?
          </button>
        </div>
        <div class="relative">
          <AppIcon name="lock" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••"
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
      </div>

      <div v-if="error" role="alert" class="alert alert-error">
        <AppIcon name="alert" :size="16" class="mt-0.5" />
        <span>{{ error }}</span>
      </div>

      <button type="submit" :disabled="loading" class="btn btn-primary !h-11 w-full">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
        {{ loading ? 'Entrando...' : 'Entrar na Guilda' }}
      </button>
    </form>

    <div class="my-8 flex items-center gap-3 text-xs text-slate-500">
      <span class="h-px flex-1 bg-white/[0.06]" />
      Não tem uma conta?
      <span class="h-px flex-1 bg-white/[0.06]" />
    </div>

    <RouterLink to="/registrar" class="btn btn-secondary !h-11 w-full">Criar Nova Conta</RouterLink>
  </AuthShell>
</template>
