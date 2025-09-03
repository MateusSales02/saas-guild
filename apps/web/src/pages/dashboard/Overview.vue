<template>
  <!-- KPI Cards -->
  <section class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <KpiCard title="Membros" :value="kpis.members" sub="Total na guilda"/>
    <KpiCard title="Online agora" :value="kpis.online" sub="Tempo real" accent/>
    <KpiCard title="Eventos (7d)" :value="kpis.events" sub="Criados na semana"/>
    <KpiCard title="Tesouro" :value="toGold(kpis.treasury)" sub="Moedas em caixa"/>
  </section>

  <!-- Charts & Lists -->
  <section class="grid lg:grid-cols-3 gap-6">
    <!-- Activity Chart -->
    <div class="lg:col-span-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">Atividade semanal</h2>
        <select v-model="range" class="text-sm rounded-lg bg-slate-800 px-2 py-1">
          <option value="7d">7 dias</option>
          <option value="30d">30 dias</option>
        </select>
      </div>
      <div class="h-56">
        <svg viewBox="0 0 400 160" class="w-full h-full">
          <defs>
            <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#C6A95D" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#C6A95D" stop-opacity="0.05" />
            </linearGradient>
          </defs>
          <g stroke="currentColor" opacity="0.1">
            <path v-for="y in 4" :key="y" :d="`M0 ${y*32} H400`" />
          </g>
          <path :d="areaPath" fill="url(#goldFill)" />
          <path :d="linePath" fill="none" stroke="#C6A95D" stroke-width="2.5" stroke-linecap="round" />
          <g>
            <circle v-for="(p,i) in points" :key="i" :cx="p.x" :cy="p.y" r="3" fill="#C6A95D" />
          </g>
        </svg>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
      <h2 class="font-semibold mb-3">Próximos eventos</h2>
      <ul class="space-y-3">
        <li v-for="ev in upcoming" :key="ev.id" class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-[#C6A95D]/15 grid place-items-center text-[#C6A95D] font-bold">{{ ev.date.split('-')[2] }}</div>
          <div class="flex-1">
            <div class="text-sm font-medium">{{ ev.title }}</div>
            <div class="text-xs opacity-70">{{ ev.date }} · {{ ev.time }} · Líder: {{ ev.lead }}</div>
          </div>
          <button class="text-xs px-3 py-1 rounded-lg bg-[#C6A95D] text-slate-900">Inscrever</button>
        </li>
      </ul>
    </div>
  </section>

  <!-- Members Table -->
  <section class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">Membros recentes</h2>
      <button class="text-sm px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800">Ver todos</button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="text-left text-xs uppercase opacity-60">
          <tr>
            <th class="py-2">Jogador</th><th class="py-2">Classe</th><th class="py-2">Nível</th><th class="py-2">Cargo</th><th class="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.id" class="border-t border-slate-800/30">
            <td class="py-2 flex items-center gap-2">
              <img :src="m.avatar" class="w-8 h-8 rounded-xl object-cover"/><span class="font-medium">{{ m.name }}</span>
            </td>
            <td class="py-2">{{ m.class }}</td>
            <td class="py-2">{{ m.level }}</td>
            <td class="py-2">{{ m.role }}</td>
            <td class="py-2">
              <span :class="['px-2 py-0.5 rounded-lg text-xs', m.online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300']">
                {{ m.online ? 'Online' : 'Offline' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const range = ref<'7d'|'30d'>('7d')
const kpis = ref({ members: 128, online: 17, events: 6, treasury: 152340 })
const upcoming = ref([
  { id: 1, title: 'Raid: Fortaleza de Aço', date: '2025-09-02', time: '20:00', lead: 'Aeryn' },
  { id: 2, title: 'Treino PVP na Arena', date: '2025-09-03', time: '21:00', lead: 'Thorgal' },
  { id: 3, title: 'Missão de Recurso', date: '2025-09-05', time: '19:30', lead: 'Lyra' },
])
const members = ref([
  { id: 1, name: 'Kael', class: 'Guerreiro', level: 62, role: 'Oficial', online: true, avatar: 'https://i.pravatar.cc/100?img=11' },
  { id: 2, name: 'Seraph', class: 'Mago', level: 59, role: 'Membro', online: false, avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 3, name: 'Nyx', class: 'Arqueira', level: 61, role: 'Raid Leader', online: true, avatar: 'https://i.pravatar.cc/100?img=13' },
  { id: 4, name: 'Bryn', class: 'Clérigo', level: 58, role: 'Membro', online: false, avatar: 'https://i.pravatar.cc/100?img=14' },
])

function toGold(n: number) { return new Intl.NumberFormat('pt-BR').format(n) + 'g' }

const points = computed(() => {
  const data7 = [8,12,9,14,11,16,13]
  const data30 = [5,6,7,9,8,10,8,12,9,11,10,12,9,8,11,13,12,14,12,15,14,13,16,15,14,17,16,18,16,17]
  const data = range.value === '7d' ? data7 : data30
  const maxY = Math.max(...data) * 1.2
  const stepX = 400 / (data.length - 1)
  return data.map((v, i) => ({ x: i * stepX, y: 160 - (v / maxY) * 140 - 10 }))
})
const linePath = computed(() => points.value.map((p,i)=> (i?`L ${p.x} ${p.y}`:`M ${p.x} ${p.y}`)).join(' '))
const areaPath = computed(() => {
  const start = `M 0 160 L 0 ${points.value[0]?.y ?? 160}`
  const line = points.value.map((p) => `L ${p.x} ${p.y}`).join(' ')
  const end = 'L 400 160 Z'
  return `${start} ${line} ${end}`
})
</script>

<script lang="ts">
export default {
  components: {
    KpiCard: {
      props: { title: String, value: [String, Number], sub: String, accent: Boolean },
      template: `
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
          <div class="text-xs uppercase tracking-wide opacity-60">{{ title }}</div>
          <div class="mt-1 flex items-end gap-2">
            <div :class="['text-2xl font-bold', accent ? 'text-[#C6A95D]' : '']">{{ value }}</div>
            <svg v-if="accent" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' class='w-4 h-4 text-[#C6A95D]'><path d='M12 3v18M5 10l7-7 7 7'/></svg>
          </div>
          <div class="text-xs opacity-70">{{ sub }}</div>
        </div>
      `,
    },
  },
}
</script>
