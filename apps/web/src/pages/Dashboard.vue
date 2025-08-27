<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-purple-600">Dashboard</h1>
    <p>Aqui ficará o resumo do clã: eventos, membros, saldo etc.</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <main class="min-h-screen p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Sala do Conselho</h1>
      <div class="flex items-center gap-3">
        <span class="opacity-80">⚔️ {{ auth.user?.name }}</span>
        <button class="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500" @click="auth.logout()">Sair</button>
      </div>
    </header>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="p-4 rounded-lg bg-slate-700/50 border border-slate-600">Eventos</div>
      <div class="p-4 rounded-lg bg-slate-700/50 border border-slate-600">Membros</div>
      <div class="p-4 rounded-lg bg-slate-700/50 border border-slate-600">Cofre</div>
    </section>
  </main>
</template>
