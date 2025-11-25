<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <header>
      <h1 class="text-2xl font-bold text-slate-50">Dashboard</h1>
      <p class="text-sm text-slate-400 mt-1">
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
        class="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Membros
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-50">{{ kpis.members }}</p>
          </div>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-2xl"
          >
            👥
          </div>
        </div>
      </div>

      <!-- Eventos (7 dias) -->
      <div
        class="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Eventos (7d)
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-50">{{ kpis.events }}</p>
          </div>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-2xl"
          >
            📅
          </div>
        </div>
      </div>

      <!-- Tesouraria -->
      <div
        class="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Tesouraria
            </p>
            <p class="mt-2 text-3xl font-bold text-[#C6A95D]">{{ toGold(kpis.treasury) }}</p>
          </div>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-2xl"
          >
            💰
          </div>
        </div>
      </div>

      <!-- Builds -->
      <div
        class="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-5 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Builds
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-50">{{ kpis.builds }}</p>
          </div>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-2xl"
          >
            ⚔️
          </div>
        </div>
      </div>
    </div>

    <!-- GRÁFICO E PRÓXIMOS EVENTOS -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Gráfico de Eventos -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-50">Eventos</h2>
            <p class="text-xs text-slate-400">Últimos {{ range === '7d' ? '7' : '30' }} dias</p>
          </div>
          <select
            v-model="range"
            class="text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 outline-none"
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
          <path :d="linePath" fill="none" stroke="#3b82f6" stroke-width="2" />

          <!-- Points -->
          <circle
            v-for="(p, i) in points"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="4"
            fill="#3b82f6"
            class="cursor-pointer hover:r-6 transition-all"
          />

          <!-- Gradient -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Próximos Eventos -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <h2 class="text-lg font-semibold text-slate-50 mb-4">Próximos Eventos</h2>

        <div v-if="upcoming.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhum evento agendado
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="ev in upcoming"
            :key="ev.id"
            class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition"
          >
            <div
              class="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30"
            >
              <span class="text-xs font-semibold text-indigo-300">
                {{ dayOfMonth(ev.event_date) }}
              </span>
              <span class="text-[10px] text-slate-400">
                {{ new Date(ev.event_date).toLocaleDateString('pt-BR', { month: 'short' }) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-50 truncate">{{ ev.name }}</p>
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
        class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <h2 class="text-lg font-semibold text-slate-50 mb-4">Membros da Guilda</h2>

        <div v-if="members.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhum membro ainda
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="m in members.slice(0, 6)"
            :key="m.id"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/40 transition"
          >
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/90 to-sky-500/90 text-xs font-semibold text-white shadow-md"
            >
              {{ (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-50 truncate">
                {{ m.user?.nickname || m.user?.email || '—' }}
              </p>
              <p class="text-xs text-slate-400">{{ roleLabel(m.role) }}</p>
            </div>
          </div>
          <div v-if="members.length > 6" class="text-xs text-slate-400 text-center pt-2">
            +{{ members.length - 6 }} membros
          </div>
        </div>
      </div>

      <!-- Builds Recentes -->
      <div
        class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <h2 class="text-lg font-semibold text-slate-50 mb-4">Builds Recentes</h2>

        <div v-if="recentBuilds.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhuma build criada ainda
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="build in recentBuilds"
            :key="build.id"
            class="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-50 truncate">{{ build.name }}</p>
                <p class="text-xs text-slate-400">
                  {{ build.class?.name || 'Sem classe' }}
                  <span v-if="build.spec"> • {{ build.spec.name }}</span>
                </p>
              </div>
              <span
                class="px-2 py-0.5 rounded text-[10px] whitespace-nowrap"
                :class="build.is_public ? 'bg-emerald-900/40 text-emerald-200' : 'bg-slate-800 text-slate-200'"
              >
                {{ build.is_public ? 'Pública' : 'Privada' }}
              </span>
            </div>
            <p v-if="build.member" class="mt-1 text-xs text-slate-500">
              Por: {{ build.member.user?.nickname || build.member.user?.email }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- RAIDS RECENTES (se houver) -->
    <div
      v-if="recentRaids.length > 0"
      class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
    >
      <h2 class="text-lg font-semibold text-slate-50 mb-4">Raids Recentes</h2>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="raid in recentRaids"
          :key="raid.id"
          class="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-sm font-medium text-slate-50">{{ raid.name }}</p>
              <p class="text-xs text-slate-400">{{ shortDate(raid.raid_date) }}</p>
            </div>
            <span
              class="px-2 py-0.5 rounded text-[10px]"
              :class="{
                'bg-emerald-900/40 text-emerald-200': raid.status === 'completed',
                'bg-amber-900/40 text-amber-200': raid.status === 'scheduled',
                'bg-slate-800 text-slate-200': raid.status === 'cancelled'
              }"
            >
              {{ statusLabel(raid.status) }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <span>👥 {{ raid.participants?.length || 0 }}</span>
            <span>💰 {{ toGold(raid.loot_distributed || 0) }}</span>
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
