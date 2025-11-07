<template>
  <section
    class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
  >
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">Raids</h2>
      <button class="text-sm px-3 py-1 rounded-lg bg-[#C6A95D] text-slate-900">Criar raid</button>
    </div>

    <ul class="space-y-3">
      <li
        v-for="r in raids"
        :key="r.id"
        class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3"
      >
        <div
          class="w-10 h-10 rounded-xl bg-[#C6A95D]/15 grid place-items-center text-[#C6A95D] font-bold"
        >
          {{ r.day }}
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium">{{ r.title }}</div>
          <div class="text-xs opacity-70">{{ r.date }} · {{ r.time }} · Líder: {{ r.lead }}</div>
        </div>
        <span
          :class="[
            'px-2 py-0.5 rounded-lg text-xs',
            r.status === 'Aberta'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-yellow-500/20 text-yellow-400',
          ]"
        >
          {{ r.status }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const raids = ref([
  {
    id: 1,
    title: 'Fortaleza de Aço',
    date: '2025-09-02',
    time: '20:00',
    lead: 'Aeryn',
    status: 'Aberta',
    day: '02',
  },
  {
    id: 2,
    title: 'Cidadela Sombria',
    date: '2025-09-06',
    time: '21:00',
    lead: 'Thorgal',
    status: 'Preparação',
    day: '06',
  },
])
</script>
