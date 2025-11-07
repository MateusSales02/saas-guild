<template>
  <div class="min-h-screen bg-[#0a0f1a] text-slate-100">
    <!-- some o header nas rotas com hideHeader -->
    <header
      v-if="!hideHeader"
      class="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-[#8a7741]/60"
    >
      <div class="max-w-7xl mx-auto h-14 px-4 flex items-center gap-4">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-[#C6A95D] ring-1 ring-[#8a7741]/50" />
          <span class="font-semibold">Guild Mesh</span>
        </RouterLink>

        <nav class="ml-6 hidden sm:flex items-center gap-1">
          <AppLink to="/" label="Home" />
          <AppLink to="/dashboard" label="Dashboard" />
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <template v-if="!authed">
            <RouterLink
              to="/registrar"
              class="px-3 py-1.5 rounded-xl bg-[#C6A95D] text-slate-900 font-semibold"
              >Registrar-se</RouterLink
            >
            <RouterLink
              to="/login"
              class="px-3 py-1.5 rounded-xl border border-[#C6A95D]/40 bg-slate-900/40 hover:bg-slate-900/60"
              >Entrar</RouterLink
            >
          </template>
          <template v-else>
            <RouterLink
              to="/logout"
              class="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800"
              >Sair</RouterLink
            >
          </template>
        </div>
      </div>
    </header>

    <!-- sem padding quando hideHeader=true (login/registrar/logout) -->
    <main :class="hideHeader ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const authed = computed(() => !!localStorage.getItem('authUser'))
const hideHeader = computed(() => route.meta.hideHeader === true)

const AppLink = {
  props: { to: [String, Object], label: String },
  template: `
    <RouterLink :to="to" v-slot="{ isActive }">
      <span :class="[
        'px-3 py-1.5 rounded-xl transition',
        isActive ? 'bg-[#C6A95D]/20 text-[#C6A95D] border border-[#C6A95D]/30'
                 : 'hover:bg-slate-800 border border-transparent'
      ]">{{ label }}</span>
    </RouterLink>
  `,
  components: { RouterLink },
}
</script>
