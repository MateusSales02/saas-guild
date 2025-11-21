<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import {
  GuildsApi,
  MembersApi,
  EventsApi,
  FinanceApi,
  BuildsApi,
  IntegrationsApi,
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

    // 👉 APENAS UM Promise.all
    const [memb, evs, fin, albionSnapshot, lastNotif, buildsRes] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      IntegrationsApi.albionStatus(),
      IntegrationsApi.lastNotification(),
      BuildsApi.list({ guildId: guild.value.id }),
    ])

    members.value = memb
    events.value = evs
    albion.value = albionSnapshot
    lastNotification.value = lastNotif

    kpis.value.members = memb.length
    kpis.value.online = 0
    kpis.value.events = countEventsInLastDays(evs, 7)
    kpis.value.treasury = fin?.balance ?? 0
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
    albionErr.value =
      e?.response?.data?.message || e.message || 'Não foi possível atualizar o status agora'
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
    discordErr.value =
      e?.response?.data?.message || e.message || 'Falha ao enviar para o Discord'
  } finally {
    sending.value = false
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
  return new Date(iso).toLocaleDateString()
}
function shortTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function countEventsInLastDays(list: EventItem[], days: number) {
  const now = Date.now()
  const cutoff = now - days * 24 * 3600 * 1000
  return list.filter((e) => new Date(e.event_date).getTime() >= cutoff).length
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
