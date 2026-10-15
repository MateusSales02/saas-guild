<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import AuthShell from '@/components/ui/AuthShell.vue'
import { api } from '@/lib/api'
import { friendlyError } from '@/lib/errors'

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
    await api.post('/auth/forgot-password', { email: email.value })
    success.value = true
  } catch (e: any) {
    error.value = friendlyError(e, 'Erro ao solicitar recuperação de senha')
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

    <!-- Enviado -->
    <div v-if="success">
      <span class="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
        <AppIcon name="mail" :size="20" />
      </span>
      <h1 class="mt-5 font-display text-3xl font-semibold tracking-wide text-slate-50">Email Enviado!</h1>
      <p class="mt-3 text-sm leading-relaxed text-slate-400">
        Se o email <strong class="font-medium text-slate-100">{{ email }}</strong> estiver cadastrado,
        você receberá instruções para redefinir sua senha.
      </p>
      <p class="mt-4 inset px-4 py-3 text-xs text-slate-500">
        Verifique sua caixa de entrada e spam. O link expira em 1 hora.
      </p>
      <RouterLink to="/login" class="btn btn-primary mt-8 !h-11 w-full">Voltar para Login</RouterLink>
    </div>

    <!-- Formulário -->
    <div v-else>
      <p class="eyebrow">Acesso</p>
      <h1 class="mt-2 font-display text-3xl font-semibold tracking-wide text-slate-50">Recuperar Senha</h1>
      <p class="mt-2 text-sm text-slate-400">Digite seu email e enviaremos um link para redefinir sua senha.</p>

      <form class="mt-8 space-y-4" @submit.prevent="recoverPassword">
        <div>
          <label for="recover-email" class="label">E-mail</label>
          <div class="relative">
            <AppIcon name="mail" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input id="recover-email" v-model="email" type="email" required autocomplete="email" placeholder="seu@email.com" class="input !h-11 !pl-10" />
          </div>
        </div>

        <div v-if="error" role="alert" class="alert alert-error">
          <AppIcon name="alert" :size="16" class="mt-0.5" />
          <span>{{ error }}</span>
        </div>

        <p class="flex items-start gap-2 text-xs text-slate-500">
          <AppIcon name="shield" :size="14" class="mt-0.5 shrink-0" />
          <span>Por segurança, não informamos se o email está cadastrado ou não.</span>
        </p>

        <button type="submit" :disabled="loading" class="btn btn-primary !h-11 w-full">
          <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
          {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-slate-500">
        Lembrou a senha?
        <RouterLink to="/login" class="link">Voltar para login</RouterLink>
      </p>
    </div>
  </AuthShell>
</template>
