<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
    <!-- Background Effects -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C6A95D]/10 rounded-full blur-3xl animate-pulse" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJWMTh6TTI4IDE4djE2aDJ2LTJoLTJ6bTAgMnYyaDJWMjB6bTAgNnYyaDJ2LTJ6bTAtNnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
    </div>

    <!-- Sidebar + Main -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      <aside
        :class="[
          'md:sticky md:top-6 h-max p-4 rounded-xl border backdrop-blur-xl shadow-2xl',
          sidebarOpen ? 'block' : 'hidden md:block',
          'border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90',
        ]"
      >
        <nav class="flex flex-col space-y-1">
          <SidebarLink icon="chart" label="Dashboard" :to="{ name: 'dashboard.overview' }" />
          <SidebarLink icon="users" label="Membros" :to="{ name: 'members' }" />
          <SidebarLink icon="swords" label="Raids" :to="{ name: 'raids' }" />
          <SidebarLink icon="calendar" label="Eventos" :to="{ name: 'events' }" />
          <SidebarLink icon="treasure" label="Tesouraria" :to="{ name: 'treasury' }" />
          <SidebarLink icon="hammer" label="Builds" :to="{ name: 'builds' }" />
          <SidebarLink icon="market" label="Mercado" :to="{ name: 'market' }" />
        </nav>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
          </svg>
          Sair
        </button>
      </aside>

      <main class="relative flex flex-col gap-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import SidebarLink from '@/components/SidebarLink.vue'
import { clearSession } from '@/stores/auth'

const sidebarOpen = ref(false)
const router = useRouter()

function logout() {
  clearSession()
  router.push('/login')
}
</script>
