<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <header class="mb-2">
      <h1 class="text-3xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent">
        Dashboard
      </h1>
      <p class="text-sm text-slate-400 mt-2">
        Visão geral da {{ guild?.name || 'sua guilda' }}
      </p>
    </header>

    <!-- ERRO -->
    <div
      v-if="err"
      class="rounded-lg border border-rose-500/70 bg-rose-950/70 px-4 py-3 text-sm text-rose-100"
    >
      ⚠️ {{ err }}
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="i in 4"
        :key="i"
        class="rounded-xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse"
      >
        <div class="h-4 w-20 bg-slate-800 rounded mb-3" />
        <div class="h-8 w-24 bg-slate-700 rounded" />
      </div>
    </div>

    <!-- KPIs -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <!-- Membros -->
      <div
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-indigo-500/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Membros
            </p>
            <p class="mt-2 text-3xl font-black text-slate-50">{{ kpis.members }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Eventos (7 dias) -->
      <div
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-emerald-500/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Eventos (7d)
            </p>
            <p class="mt-2 text-3xl font-black text-slate-50">{{ kpis.events }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tesouraria -->
      <div
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-[#C6A95D]/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-[#C6A95D]/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tesouraria
            </p>
            <p class="mt-2 text-3xl font-black text-[#C6A95D]">{{ toGold(kpis.treasury) }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#C6A95D] to-amber-500 shadow-lg shadow-[#C6A95D]/30"
          >
            <svg class="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Builds -->
      <div
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-rose-500/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Builds
            </p>
            <p class="mt-2 text-3xl font-black text-slate-50">{{ kpis.builds }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- GRÁFICO E PRÓXIMOS EVENTOS -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Gráfico de Eventos -->
      <div
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
              Eventos
            </h2>
            <p class="text-xs text-slate-400 mt-1">Últimos {{ range === '7d' ? '7' : '30' }} dias</p>
          </div>
          <select
            v-model="range"
            class="text-xs px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
          </select>
        </div>

        <!-- SVG Chart -->
        <svg viewBox="0 0 400 160" class="w-full h-40">
          <!-- Grid lines -->
          <line
            v-for="i in 5"
            :key="i"
            x1="0"
            :y1="i * 40"
            x2="400"
            :y2="i * 40"
            stroke="#1e293b"
            stroke-width="1"
            stroke-dasharray="4 4"
          />

          <!-- Area -->
          <path :d="areaPath" fill="url(#gradient)" opacity="0.3" />

          <!-- Line -->
          <path :d="linePath" fill="none" stroke="#C6A95D" stroke-width="3" />

          <!-- Points -->
          <circle
            v-for="(p, i) in points"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="5"
            fill="#C6A95D"
            class="cursor-pointer hover:r-7 transition-all"
          />

          <!-- Gradient -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#C6A95D" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#C6A95D" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Próximos Eventos -->
      <div
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
          Próximos Eventos
        </h2>

        <div v-if="upcoming.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhum evento agendado
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="ev in upcoming"
            :key="ev.id"
            class="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-300"
          >
            <div
              class="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all"
            >
              <span class="text-sm font-bold text-emerald-300">
                {{ dayOfMonth(ev.event_date) }}
              </span>
              <span class="text-[10px] text-slate-400 uppercase">
                {{ new Date(ev.event_date).toLocaleDateString('pt-BR', { month: 'short' }) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-50 truncate">{{ ev.name }}</p>
              <p class="text-xs text-slate-400">
                {{ shortTime(ev.event_date) }}
                <span v-if="ev.lead" class="ml-2">• {{ ev.lead }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MEMBROS E BUILDS RECENTES -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Membros Recentes -->
      <div
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
          Membros da Guilda
        </h2>

        <div v-if="members.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhum membro ainda
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="m in members.slice(0, 6)"
            :key="m.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-indigo-500/30 transition-all duration-300"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
            >
              {{ (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-50 truncate">
                {{ m.user?.nickname || m.user?.email || '—' }}
              </p>
              <p class="text-xs text-slate-400">{{ roleLabel(m.role) }}</p>
            </div>
          </div>
          <div v-if="members.length > 6" class="text-xs text-slate-400 text-center pt-3 border-t border-slate-800 mt-3">
            +{{ members.length - 6 }} membros
          </div>
        </div>
      </div>

      <!-- Builds Recentes -->
      <div
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
          Builds Recentes
        </h2>

        <div v-if="recentBuilds.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhuma build criada ainda
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="build in recentBuilds"
            :key="build.id"
            class="group p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-rose-500/50 hover:bg-slate-800/60 transition-all duration-300"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-50 truncate group-hover:text-rose-300 transition-colors">
                  {{ build.name }}
                </p>
                <p class="text-xs text-slate-400 mt-1">
                  {{ build.class?.name || 'Sem classe' }}
                  <span v-if="build.spec"> • {{ build.spec.name }}</span>
                </p>
              </div>
              <span
                class="px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap border"
                :class="build.is_public ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-700/50 text-slate-300 border-slate-600'"
              >
                {{ build.is_public ? 'Pública' : 'Privada' }}
              </span>
            </div>
            <p v-if="build.member" class="mt-2 text-xs text-slate-500">
              Por: {{ build.member.user?.nickname || build.member.user?.email }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- RAIDS RECENTES (se houver) -->
    <div
      v-if="recentRaids.length > 0"
      class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
    >
      <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
        Raids Recentes
      </h2>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="raid in recentRaids"
          :key="raid.id"
          class="group p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-50 truncate">{{ raid.name }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ shortDate(raid.raid_date) }}</p>
            </div>
            <span
              class="px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap border ml-2"
              :class="{
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': raid.status === 'completed',
                'bg-amber-500/20 text-amber-300 border-amber-500/40': raid.status === 'scheduled',
                'bg-slate-700/50 text-slate-300 border-slate-600': raid.status === 'cancelled'
              }"
            >
              {{ statusLabel(raid.status) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5 text-indigo-300">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span>{{ raid.participants?.length || 0 }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-[#C6A95D]">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
              </svg>
              <span>{{ toGold(raid.loot_distributed || 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import {
  GuildsApi,
  MembersApi,
  EventsApi,
  FinanceApi,
  BuildsApi,
} from '@/lib/api'

type Member = { id: number; role: string; user: { id: number; email: string; nickname?: string } }
type EventItem = {
  id: number
  name: string
  event_date: string
  recurring: boolean
  description?: string
  lead?: string
}

const range = ref<'7d' | '30d'>('7d')
const kpis = ref({ members: 0, online: 0, events: 0, treasury: 0, builds: 0 })
const members = ref<Member[]>([])
const events = ref<EventItem[]>([])
const guild = ref<any>(null)
const loading = ref(true)
const err = ref('')
const recentBuilds = ref<any[]>([])
const recentRaids = ref<any[]>([])

onMounted(load)

async function load() {
  loading.value = true
  err.value = ''

  try {
    const guilds = await GuildsApi.list()
    guild.value = guilds?.[0] ?? null

    if (!guild.value) {
      members.value = []
      events.value = []
      kpis.value = { members: 0, online: 0, events: 0, treasury: 0, builds: 0 }
      return
    }

    const [memb, evs, fin, buildsRes] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      BuildsApi.list({ guildId: guild.value.id }),
    ])

    members.value = memb
    events.value = evs
    recentBuilds.value = (buildsRes as any[])?.slice(0, 6) ?? []
    recentRaids.value = []

    kpis.value.members = memb.length
    kpis.value.online = 0
    kpis.value.events = countEventsInLastDays(evs, 7)
    kpis.value.treasury = fin?.balance ?? 0
    kpis.value.builds = (buildsRes as any[])?.length ?? 0

  } catch (e: any) {
    err.value = e.message || 'Falha ao carregar dashboard'
  } finally {
    loading.value = false
  }
}

// ---- Helpers ----
function toGold(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n) + 'g'
}
function dayOfMonth(iso: string) {
  return new Date(iso).getDate().toString().padStart(2, '0')
}
function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}
function shortTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function countEventsInLastDays(list: EventItem[], days: number) {
  const now = Date.now()
  const cutoff = now - days * 24 * 3600 * 1000
  return list.filter((e) => new Date(e.event_date).getTime() >= cutoff).length
}

function roleLabel(role: string) {
  switch (role) {
    case 'leader': return 'Líder'
    case 'officer': return 'Oficial'
    case 'líder': return 'Líder'
    default: return 'Membro'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'completed': return 'Completa'
    case 'scheduled': return 'Agendada'
    case 'cancelled': return 'Cancelada'
    default: return status
  }
}

// Próximos eventos
const upcoming = computed(() => {
  const now = Date.now()
  return [...events.value]
    .filter((e) => new Date(e.event_date).getTime() >= now)
    .sort((a, b) => +new Date(a.event_date) - +new Date(b.event_date))
    .slice(0, 5)
})

// Gráfico
const points = computed(() => {
  const days = range.value === '7d' ? 7 : 30
  const series = buildDailySeries(events.value, days)
  const maxY = Math.max(1, ...series) * 1.2
  const stepX = 400 / (series.length - 1 || 1)
  return series.map((v, i) => ({
    x: i * stepX,
    y: 160 - (v / maxY) * 140 - 10,
  }))
})

const linePath = computed(() =>
  points.value.map((p, i) => (i ? `L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`)).join(' ')
)

const areaPath = computed(() => {
  if (points.value.length === 0) return 'M 0 160 L 400 160 Z'
  const start = `M 0 160 L 0 ${points.value[0].y}`
  const line = points.value.map((p) => `L ${p.x} ${p.y}`).join(' ')
  const end = 'L 400 160 Z'
  return `${start} ${line} ${end}`
})

function buildDailySeries(list: EventItem[], days: number) {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)

  const buckets: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    buckets[d.toISOString().slice(0, 10)] = 0
  }

  for (const ev of list) {
    const key = new Date(ev.event_date).toISOString().slice(0, 10)
    if (key in buckets) buckets[key]++
  }

  return Object.values(buckets)
}
</script>
