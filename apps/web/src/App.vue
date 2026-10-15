<template>
  <div class="min-h-screen text-slate-300">
    <!-- some o header nas rotas com hideHeader -->
    <header
      v-if="!hideHeader"
      class="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl"
    >
      <div class="max-w-7xl mx-auto h-14 px-4 flex items-center gap-4">
        <RouterLink to="/" class="flex items-center gap-2.5">
          <div class="h-8 w-8 rounded-lg border border-gold-500/40 bg-gold-500/10" />
          <span class="font-display font-semibold tracking-wider text-slate-50">Guild Mesh</span>
        </RouterLink>

        <nav class="ml-6 hidden sm:flex items-center gap-1">
          <AppLink to="/" label="Home" />
          <AppLink to="/dashboard" label="Dashboard" />
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <template v-if="!authed">
            <RouterLink to="/registrar" class="btn btn-primary btn-sm">Registrar-se</RouterLink>
            <RouterLink to="/login" class="btn btn-secondary btn-sm">Entrar</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/logout" class="btn btn-secondary btn-sm">Sair</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <main :class="hideHeader ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { auth } from '@/stores/auth'

const route = useRoute()
const authed = computed(() => !!auth.token)
const hideHeader = computed(() => route.meta.hideHeader === true)

const AppLink = {
  props: { to: [String, Object], label: String },
  template: `
    <RouterLink :to="to" v-slot="{ isActive }">
      <span :class="[
        'px-3 py-1.5 rounded-lg text-sm transition',
        isActive ? 'bg-gold-500/10 text-gold-200 border border-gold-500/30'
                 : 'hover:bg-white/[0.04] border border-transparent'
      ]">{{ label }}</span>
    </RouterLink>
  `,
  components: { RouterLink },
}
</script>
