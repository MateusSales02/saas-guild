<template>
  <div class="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
    <!-- Topbar ... (igual) -->

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
      <aside :class="['md:sticky md:top-20 h-max p-3 rounded-2xl border',
                      sidebarOpen ? 'block' : 'hidden md:block',
                      'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur']">
        <nav class="flex flex-col">
          <SidebarLink icon="users"    label="Membros"     :to="{ name: 'members' }" />
          <SidebarLink icon="swords"   label="Raids"       :to="{ name: 'raids' }" />
          <SidebarLink icon="calendar" label="Eventos"     :to="{ name: 'events' }" />
          <SidebarLink icon="treasure" label="Tesouraria"  :to="{ name: 'treasury' }" />
          <SidebarLink icon="settings" label="Visão geral" :to="{ name: 'dashboard.overview' }" />
        </nav>
      </aside>

      <main class="flex flex-col gap-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SidebarLink from '@/components/SidebarLink.vue'

const sidebarOpen = ref(false)
const username   = localStorage.getItem('authUser') ?? 'Aventureiro'
const avatarUrl  = 'https://images.unsplash.com/photo-1541534401786-2077eed87a4b?q=80&w=200&auto=format&fit=crop'
const alerts     = ref(3)
const q          = ref('')
</script>
