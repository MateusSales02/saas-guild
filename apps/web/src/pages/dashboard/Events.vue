<template>
  <section class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">Eventos</h2>
      <button class="text-sm px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800">Novo evento</button>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <article v-for="ev in events" :key="ev.id" class="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div class="text-xs uppercase opacity-60">{{ ev.type }}</div>
        <div class="mt-1 font-medium">{{ ev.title }}</div>
        <div class="text-xs opacity-70">{{ ev.date }} · {{ ev.time }}</div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const events = ref([
  { id: 1, type: 'Treino', title: 'PVP na Arena',  date: '2025-09-03', time: '21:00' },
  { id: 2, type: 'Social', title: 'Feira da Guilda', date: '2025-09-04', time: '19:00' },
  { id: 3, type: 'Missão', title: 'Recursos Raros',  date: '2025-09-05', time: '19:30' },
])
</script>