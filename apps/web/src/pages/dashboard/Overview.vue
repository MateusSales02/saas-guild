<template>
  <!-- KPI Cards -->
  <section class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <KpiCard title="Membros" :value="kpis.members" sub="Total na guilda" />
    <KpiCard title="Online agora" :value="kpis.online" sub="Tempo real" accent />
    <KpiCard title="Eventos (7d)" :value="kpis.events" sub="Criados na semana" />
    <KpiCard title="Tesouro" :value="toGold(kpis.treasury)" sub="Moedas em caixa" />
    <KpiCard title="Builds" :value="kpis.builds" sub="Compartilhadas" />
  </section>

  <div v-if="err" class="mt-4 text-sm text-red-400">{{ err }}</div>
  <div v-else-if="loading" class="mt-4 text-sm opacity-70">Carregando overview...</div>

  <section class="grid lg:grid-cols-3 gap-4 mt-4">
    <div
      class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 lg:col-span-2"
    >
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="font-semibold">Status do Albion</h2>
          <p class="text-xs opacity-70">Consulta externa e cache em background</p>
        </div>
        <button
          class="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800"
          @click="refreshAlbion"
        >
          Atualizar agora
        </button>
      </div>

      <div v-if="albionErr" class="text-sm text-red-400">{{ albionErr }}</div>
      <div v-else class="grid md:grid-cols-2 gap-3">
        <div>
          <h3 class="text-xs uppercase opacity-60 mb-2">Servidores</h3>
          <ul class="space-y-2">
            <li
              v-for="srv in albion.servers"
              :key="srv.server"
              class="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div>
                <div class="text-sm font-medium">{{ srv.server }}</div>
                <div class="text-xs opacity-70">{{ srv.message || 'Sem alerta' }}</div>
              </div>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded-lg',
                  srv.status === 'online' ? 'bg-green-900/50 text-green-200' : 'bg-amber-900/50 text-amber-100',
                ]"
              >
                {{ srv.status || 'indefinido' }}
              </span>
            </li>
            <li v-if="albion.servers.length === 0" class="text-sm opacity-70">Sem dados de status.</li>
          </ul>
        </div>
        <div>
          <h3 class="text-xs uppercase opacity-60 mb-2">Atividades recentes</h3>
          <ul class="space-y-2 max-h-48 overflow-auto pr-1">
            <li
              v-for="act in albion.activities"
              :key="act.EventId"
              class="p-3 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div class="text-sm font-medium">{{ act.KillerGuildName || 'Guilda desconhecida' }}</div>
              <div class="text-xs opacity-70">
                {{ new Date(act.EventTime).toLocaleString() }} · Fame: {{ act.TotalVictimKillFame || 0 }}
              </div>
            </li>
            <li v-if="albion.activities.length === 0" class="text-sm opacity-70">Nenhuma atividade listada.</li>
          </ul>
        </div>
      </div>
      <div class="text-xs opacity-60 mt-2">Atualizado em {{ albion.lastUpdated }}</div>
    </div>

    <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
      <h2 class="font-semibold mb-3">Notificações no Discord</h2>
      <label class="text-xs uppercase opacity-60">Mensagem</label>
      <textarea
        v-model="discordMessage"
        rows="3"
        class="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
        placeholder="Aviso para os membros"
      ></textarea>
      <div class="flex items-center gap-2 mt-3">
        <button
          class="text-sm px-3 py-2 rounded-lg bg-[#C6A95D] text-slate-900 disabled:opacity-50"
          :disabled="sending"
          @click="sendDiscord"
        >
          {{ sending ? 'Enviando...' : 'Enviar webhook' }}
        </button>
        <div class="text-xs opacity-60" v-if="lastNotification">
          Último envio: {{ new Date(lastNotification.sentAt).toLocaleString() }}
        </div>
      </div>
      <div v-if="discordErr" class="text-sm text-red-400 mt-2">{{ discordErr }}</div>
      <div v-if="discordOk" class="text-sm text-green-400 mt-2">{{ discordOk }}</div>
    </div>
  </section>

  <!-- Charts & Lists -->
  <section class="grid lg:grid-cols-3 gap-6 mt-6">
    <!-- Activity Chart -->
    <div
      class="lg:col-span-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
    >
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
            <path v-for="y in 4" :key="y" :d="`M0 ${y * 32} H400`" />
          </g>
          <path :d="areaPath" fill="url(#goldFill)" />
          <path
            :d="linePath"
            fill="none"
            stroke="#C6A95D"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <g>
            <circle v-for="(p, i) in points" :key="i" :cx="p.x" :cy="p.y" r="3" fill="#C6A95D" />
          </g>
        </svg>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div
      class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
    >
      <h2 class="font-semibold mb-3">Próximos eventos</h2>
      <ul class="space-y-3">
        <li
          v-for="ev in upcoming"
          :key="ev.id"
          class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <div
            class="w-10 h-10 rounded-xl bg-[#C6A95D]/15 grid place-items-center text-[#C6A95D] font-bold"
          >
            {{ dayOfMonth(ev.event_date) }}
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium">{{ ev.name }}</div>
            <div class="text-xs opacity-70">
              {{ shortDate(ev.event_date) }} · {{ shortTime(ev.event_date) }}
              <span v-if="ev.lead"> · Líder: {{ ev.lead }}</span>
            </div>
          </div>
          <button class="text-xs px-3 py-1 rounded-lg bg-[#C6A95D] text-slate-900">
            Inscrever
          </button>
        </li>
        <li v-if="upcoming.length === 0" class="opacity-70 text-sm">Nenhum evento futuro.</li>
      </ul>
    </div>
  </section>

  <!-- Members Table -->
  <section
    class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 mt-6"
  >
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">Membros recentes</h2>
      <button class="text-sm px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800">
        Ver todos
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="text-left text-xs uppercase opacity-60">
          <tr>
            <th class="py-2">Jogador</th>
            <th class="py-2">E-mail</th>
            <th class="py-2">Cargo</th>
            <th class="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.id" class="border-t border-slate-800/30">
            <td class="py-2 font-medium">{{ m.user?.nickname || m.user?.email }}</td>
            <td class="py-2">{{ m.user?.email }}</td>
            <td class="py-2">{{ m.role }}</td>
            <td class="py-2">
              <span class="px-2 py-0.5 rounded-lg text-xs bg-slate-700 text-slate-300">
                Offline
              </span>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td class="py-4 text-center opacity-70" colspan="4">Nenhum membro.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { GuildsApi, MembersApi, EventsApi, FinanceApi, BuildsApi } from '@/lib/api'
=======
import { GuildsApi, MembersApi, EventsApi, FinanceApi, IntegrationsApi } from '@/lib/api'
>>>>>>> theirs
=======
import { GuildsApi, MembersApi, EventsApi, FinanceApi } from '@/lib/api'
>>>>>>> theirs
=======
import { GuildsApi, MembersApi, EventsApi, FinanceApi, IntegrationsApi } from '@/lib/api'
>>>>>>> theirs

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
const albion = ref<{ servers: any[]; activities: any[]; lastUpdated: string }>({
  servers: [],
  activities: [],
  lastUpdated: '',
})
const albionErr = ref('')
const discordMessage = ref('Convocação para próximos eventos!')
const sending = ref(false)
const discordErr = ref('')
const discordOk = ref('')
const lastNotification = ref<any>(null)

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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    const [memb, evs, fin, buildsRes] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      BuildsApi.list({ guildId: guild.value.id }),
=======
    const [memb, evs, fin, albionSnapshot, lastNotif] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      IntegrationsApi.albionStatus(),
      IntegrationsApi.lastNotification(),
>>>>>>> theirs
=======
    const [memb, evs, fin] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
>>>>>>> theirs
=======
    const [memb, evs, fin, albionSnapshot, lastNotif] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      IntegrationsApi.albionStatus(),
      IntegrationsApi.lastNotification(),
>>>>>>> theirs
    ])
    members.value = memb
    events.value = evs
    albion.value = albionSnapshot
    lastNotification.value = lastNotif

    // KPIs
    kpis.value.members = memb.length
    kpis.value.online = 0 // sem presença online no MVP
    kpis.value.events = countEventsInLastDays(evs, 7)
    kpis.value.treasury = fin?.balance ?? 0 // saldo real da API
    kpis.value.builds = (buildsRes as any[])?.length ?? 0
  } catch (e: any) {
    err.value = e.message || 'Falha ao carregar overview'
  } finally {
    loading.value = false
  }
}

async function refreshAlbion() {
  albionErr.value = ''
  try {
    albion.value = await IntegrationsApi.refreshAlbion()
  } catch (e: any) {
    albionErr.value = e?.response?.data?.message || e.message || 'Não foi possível atualizar o status agora'
  }
}

async function sendDiscord() {
  discordErr.value = ''
  discordOk.value = ''
  sending.value = true
  try {
    const res = await IntegrationsApi.sendDiscord(discordMessage.value)
    discordOk.value = 'Mensagem enviada para o Discord'
    lastNotification.value = res
  } catch (e: any) {
    discordErr.value = e?.response?.data?.message || e.message || 'Falha ao enviar para o Discord'
  } finally {
    sending.value = false
  }
}

// ---- Helpers de formatação/data ----
function toGold(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n) + 'g'
}
function dayOfMonth(iso: string) {
  return new Date(iso).getDate().toString().padStart(2, '0')
}
function shortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString()
}
function shortTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function countEventsInLastDays(list: EventItem[], days: number) {
  const now = Date.now()
  const cutoff = now - days * 24 * 3600 * 1000
  return list.filter((e) => new Date(e.event_date).getTime() >= cutoff).length
}

// Próximos eventos (futuros)
const upcoming = computed(() => {
  const now = Date.now()
  return [...events.value]
    .filter((e) => new Date(e.event_date).getTime() >= now)
    .sort((a, b) => +new Date(a.event_date) - +new Date(b.event_date))
    .slice(0, 5)
})

// Série do gráfico a partir dos eventos
const points = computed(() => {
  const days = range.value === '7d' ? 7 : 30
  const series = buildDailySeries(events.value, days)
  const maxY = Math.max(1, ...series) * 1.2
  const stepX = 400 / (series.length - 1 || 1)
  return series.map((v, i) => ({ x: i * stepX, y: 160 - (v / maxY) * 140 - 10 }))
})
const linePath = computed(() =>
  points.value.map((p, i) => (i ? `L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`)).join(' '),
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
    const key = d.toISOString().slice(0, 10) // yyyy-mm-dd
    buckets[key] = 0
  }
  for (const ev of list) {
    const key = new Date(ev.event_date).toISOString().slice(0, 10)
    if (key in buckets) buckets[key]++
  }
  return Object.values(buckets)
}
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
