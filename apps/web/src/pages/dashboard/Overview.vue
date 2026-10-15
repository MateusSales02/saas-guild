<template>
  <div class="page">
    <PageHeader :eyebrow="guild?.name ?? 'Painel'" title="Visão geral" :subtitle="todayLabel">
      <template #actions>
        <button type="button" class="btn btn-secondary btn-sm" @click="showCustomizeModal = true">
          <AppIcon name="settings" :size="16" />
          Personalizar
        </button>
      </template>
    </PageHeader>

    <div v-if="err" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <div class="flex-1">
        <p class="font-medium">Não foi possível carregar o painel</p>
        <p class="mt-0.5 text-rose-200/80">{{ err }}</p>
      </div>
      <button type="button" class="btn btn-danger btn-sm" @click="load">Tentar novamente</button>
    </div>

    <!-- SEM GUILDA -->
    <div v-if="!loading && !guild" class="panel">
      <EmptyState
        icon="shield"
        title="Nenhuma guilda encontrada"
        text="Você ainda não faz parte de nenhuma guilda. Crie uma nova ou peça um convite ao líder."
      />
    </div>

    <template v-else>
      <!-- KPIs -->
      <div v-if="visibleKpis.length" class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <template v-if="loading">
          <div v-for="i in visibleKpis.length" :key="i" class="stat">
            <div class="skeleton h-4 w-24" />
            <div class="skeleton mt-3 h-7 w-20" />
          </div>
        </template>
        <RouterLink
          v-for="kpi in visibleKpis"
          v-else
          :key="kpi.key"
          :to="kpi.to"
          class="stat group transition-colors hover:border-gold-500/25"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="stat-label">{{ kpi.label }}</p>
            <span class="icon-tile">
              <AppIcon :name="kpi.icon" :size="17" />
            </span>
          </div>
          <p class="stat-value" :class="kpi.accent ? 'text-gold-200' : ''">{{ kpi.value }}</p>
          <p class="stat-meta flex items-center gap-1">
            {{ kpi.meta }}
            <AppIcon name="arrow-up-right" :size="12" class="opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
        </RouterLink>
      </div>

      <!-- GRÁFICOS -->
      <div v-if="widgets.eventsChart || widgets.treasuryChart" class="grid gap-4" :class="{ 'xl:grid-cols-2': widgets.eventsChart && widgets.treasuryChart }">
        <section v-if="widgets.eventsChart" class="panel">
          <header class="panel-header">
            <div>
              <h2 class="panel-title">Atividade de eventos</h2>
              <p class="panel-subtitle">{{ eventsInRange }} {{ eventsInRange === 1 ? 'evento' : 'eventos' }} nos últimos {{ rangeDays(eventRange) }} dias</p>
            </div>
            <RangeToggle v-model="eventRange" />
          </header>
          <div class="panel-body">
            <div v-if="loading" class="skeleton h-[200px]" />
            <TrendChart v-else type="bar" :points="eventSeries" aria-label="Eventos por dia" :format-value="formatEvents" />
          </div>
        </section>

        <section v-if="widgets.treasuryChart" class="panel">
          <header class="panel-header">
            <div>
              <h2 class="panel-title">Evolução da tesouraria</h2>
              <p class="panel-subtitle">
                <template v-if="treasuryDelta !== null">
                  <span :class="treasuryDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'">
                    {{ treasuryDelta >= 0 ? '+' : '' }}{{ toGold(treasuryDelta) }}
                  </span>
                  nos últimos {{ rangeDays(treasuryRange) }} dias
                </template>
                <template v-else>Saldo diário</template>
              </p>
            </div>
            <RangeToggle v-model="treasuryRange" />
          </header>
          <div class="panel-body">
            <div v-if="loading" class="skeleton h-[200px]" />
            <TrendChart v-else-if="treasurySeries.length" :points="treasurySeries" aria-label="Saldo da tesouraria" :format-value="toGold" />
            <EmptyState v-else icon="coins" title="Sem movimentações no período" />
          </div>
        </section>
      </div>

      <!-- PRÓXIMOS EVENTOS -->
      <section v-if="widgets.upcomingEvents" class="panel">
        <header class="panel-header">
          <div>
            <h2 class="panel-title">Próximos eventos</h2>
            <p class="panel-subtitle">Agenda da guilda</p>
          </div>
          <RouterLink :to="{ name: 'events' }" class="btn btn-ghost btn-sm">
            Ver agenda <AppIcon name="chevron-right" :size="14" />
          </RouterLink>
        </header>
        <div v-if="loading" class="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="i in 3" :key="i" class="skeleton h-16" />
        </div>
        <EmptyState v-else-if="upcoming.length === 0" icon="calendar" title="Nenhum evento agendado" text="Crie um evento para reunir a guilda.">
          <RouterLink :to="{ name: 'events' }" class="btn btn-secondary btn-sm"><AppIcon name="plus" :size="14" /> Novo evento</RouterLink>
        </EmptyState>
        <ul v-else class="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          <li v-for="ev in upcoming" :key="ev.id" class="inset flex items-center gap-4 p-3 transition-colors hover:border-gold-500/20">
            <div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-gold-500/25 bg-gold-500/[0.06]">
              <span class="text-base font-semibold leading-none tabular-nums text-gold-200">{{ dayOfMonth(ev.date) }}</span>
              <span class="mt-1 text-[9px] font-semibold uppercase tracking-wider text-gold-500/80">{{ monthShort(ev.date) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-100">{{ ev.title }}</p>
              <p class="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <AppIcon name="clock" :size="12" /> {{ weekdayTime(ev.date) }}
                <template v-if="ev.location"><span aria-hidden="true">·</span><span class="truncate">{{ ev.location }}</span></template>
              </p>
            </div>
            <span v-if="ev.type" class="badge badge-neutral">{{ eventTypeLabel(ev.type) }}</span>
          </li>
        </ul>
      </section>

      <!-- MEMBROS E BUILDS -->
      <div v-if="widgets.membersList || widgets.buildsList" class="grid gap-4" :class="{ 'xl:grid-cols-2': widgets.membersList && widgets.buildsList }">
        <section v-if="widgets.membersList" class="panel">
          <header class="panel-header">
            <div>
              <h2 class="panel-title">Membros da guilda</h2>
              <p class="panel-subtitle">{{ members.length }} no total</p>
            </div>
            <RouterLink :to="{ name: 'members' }" class="btn btn-ghost btn-sm">
              Gerenciar <AppIcon name="chevron-right" :size="14" />
            </RouterLink>
          </header>
          <div v-if="loading" class="space-y-2 p-5">
            <div v-for="i in 4" :key="i" class="skeleton h-11" />
          </div>
          <EmptyState v-else-if="members.length === 0" icon="users" title="Nenhum membro ainda" />
          <ul v-else class="divide-y divide-white/[0.04] px-2 py-2">
            <li v-for="m in members.slice(0, 6)" :key="m.id" class="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-ink-700 text-xs font-semibold text-slate-200">
                {{ initial(m) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-100">{{ m.user?.nickname || m.user?.email || '—' }}</p>
                <p class="truncate text-xs text-slate-500">{{ m.user?.email }}</p>
              </div>
              <span class="badge" :class="roleBadge(m.role)">{{ roleLabel(m.role) }}</span>
            </li>
          </ul>
          <footer v-if="members.length > 6" class="panel-footer justify-center">
            +{{ members.length - 6 }} membros
          </footer>
        </section>

        <section v-if="widgets.buildsList" class="panel">
          <header class="panel-header">
            <div>
              <h2 class="panel-title">Builds recentes</h2>
              <p class="panel-subtitle">Equipamentos montados pela guilda</p>
            </div>
            <RouterLink :to="{ name: 'builds' }" class="btn btn-ghost btn-sm">
              Ver builds <AppIcon name="chevron-right" :size="14" />
            </RouterLink>
          </header>
          <div v-if="loading" class="space-y-2 p-5">
            <div v-for="i in 4" :key="i" class="skeleton h-11" />
          </div>
          <EmptyState v-else-if="recentBuilds.length === 0" icon="hammer" title="Nenhuma build criada ainda">
            <RouterLink :to="{ name: 'builds' }" class="btn btn-secondary btn-sm"><AppIcon name="plus" :size="14" /> Criar build</RouterLink>
          </EmptyState>
          <ul v-else class="divide-y divide-white/[0.04] px-2 py-2">
            <li v-for="build in recentBuilds" :key="build.id" class="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <span class="icon-tile"><AppIcon name="swords" :size="16" /></span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-100">{{ build.name }}</p>
                <p class="truncate text-xs text-slate-500">
                  {{ build.class?.name || 'Sem classe' }}<template v-if="build.spec"> · {{ build.spec.name }}</template>
                  <template v-if="build.member"> · por {{ build.member.user?.nickname || build.member.user?.email }}</template>
                </p>
              </div>
              <span class="badge" :class="build.is_public ? 'badge-success' : 'badge-neutral'">
                {{ build.is_public ? 'Pública' : 'Privada' }}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <!-- MODAL DE PERSONALIZAÇÃO -->
    <Teleport to="body">
      <div v-if="showCustomizeModal" class="modal-backdrop" @mousedown.self="showCustomizeModal = false" @keydown.esc="showCustomizeModal = false">
        <div class="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="customize-title">
          <header class="panel-header">
            <div>
              <h2 id="customize-title" class="section-title">Personalizar painel</h2>
              <p class="panel-subtitle">Escolha o que aparece na visão geral</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="showCustomizeModal = false">
              <AppIcon name="x" />
            </button>
          </header>
          <ul class="divide-y divide-white/[0.05] px-5">
            <li v-for="(value, key) in widgets" :key="key" class="flex items-center justify-between gap-4 py-3">
              <div>
                <p class="text-sm font-medium text-slate-200">{{ WIDGET_META[key].label }}</p>
                <p class="text-xs text-slate-500">{{ WIDGET_META[key].description }}</p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="value"
                :aria-label="WIDGET_META[key].label"
                class="relative h-6 w-11 shrink-0 rounded-full border transition-colors"
                :class="value ? 'border-gold-500/60 bg-gold-500/80' : 'border-white/10 bg-ink-700'"
                @click="widgets[key] = !widgets[key]"
              >
                <span
                  class="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform"
                  :class="value ? 'translate-x-[22px]' : 'translate-x-0.5'"
                />
              </button>
            </li>
          </ul>
          <footer class="flex gap-2 border-t border-white/[0.06] p-4">
            <button type="button" class="btn btn-ghost flex-1" @click="resetWidgets">Restaurar padrão</button>
            <button type="button" class="btn btn-primary flex-1" @click="saveWidgets">Salvar</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, watch } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TrendChart from '@/components/ui/TrendChart.vue'
import type { IconName } from '@/components/ui/icons'
import { BuildsApi, EventsApi, FinanceApi, MembersApi } from '@/lib/api'
import { friendlyError } from '@/lib/errors'
import { auth } from '@/stores/auth'

type Range = '7d' | '30d'
type Member = { id: number; role: string; user: { id: number; email: string; nickname?: string } }
type EventItem = { id: number; title: string; date: string; description?: string; location?: string; type?: string }

/** Alternador 7d / 30d */
const RangeToggle = defineComponent({
  props: { modelValue: { type: String, required: true } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'div',
        { class: 'seg', role: 'group', 'aria-label': 'Período' },
        (['7d', '30d'] as const).map((r) =>
          h(
            'button',
            {
              type: 'button',
              class: 'seg-item',
              'aria-pressed': props.modelValue === r,
              onClick: () => emit('update:modelValue', r),
            },
            r === '7d' ? '7 dias' : '30 dias',
          ),
        ),
      )
  },
})

const DEFAULT_WIDGETS = {
  members: true,
  events: true,
  treasury: true,
  builds: true,
  eventsChart: true,
  treasuryChart: true,
  upcomingEvents: true,
  membersList: true,
  buildsList: true,
}
type WidgetKey = keyof typeof DEFAULT_WIDGETS

const WIDGET_META: Record<WidgetKey, { label: string; description: string }> = {
  members: { label: 'Indicador de membros', description: 'Total de membros da guilda' },
  events: { label: 'Indicador de eventos', description: 'Eventos dos últimos 7 dias' },
  treasury: { label: 'Indicador de tesouraria', description: 'Saldo atual da tesouraria' },
  builds: { label: 'Indicador de builds', description: 'Total de builds criadas' },
  eventsChart: { label: 'Gráfico de eventos', description: 'Eventos por dia' },
  treasuryChart: { label: 'Gráfico de tesouraria', description: 'Evolução do saldo' },
  upcomingEvents: { label: 'Próximos eventos', description: 'Agenda da guilda' },
  membersList: { label: 'Lista de membros', description: 'Membros da guilda' },
  buildsList: { label: 'Builds recentes', description: 'Últimas builds criadas' },
}

const EVENT_TYPES: Record<string, string> = { RAID: 'Raid', GATHERING: 'Coleta', DUNGEON: 'Dungeon', PVP: 'PvP' }

const eventRange = ref<Range>('7d')
const treasuryRange = ref<Range>('7d')
const kpis = ref({ members: 0, events: 0, treasury: 0, builds: 0 })
const members = ref<Member[]>([])
const events = ref<EventItem[]>([])
const guild = ref<{ id: number; name: string } | null>(null)
const loading = ref(true)
const err = ref('')
const recentBuilds = ref<any[]>([])
const showCustomizeModal = ref(false)
const treasuryHistoryData = ref<Array<{ date: string; balance: number }>>([])
const widgets = ref({ ...DEFAULT_WIDGETS })

const todayLabel = computed(() => {
  const text = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return text.charAt(0).toUpperCase() + text.slice(1)
})

const visibleKpis = computed(() => {
  const all: Array<{ key: WidgetKey; label: string; value: string; meta: string; icon: IconName; to: RouteLocationRaw; accent?: boolean }> = [
    { key: 'members', label: 'Membros', value: String(kpis.value.members), meta: 'na guilda', icon: 'users', to: { name: 'members' } },
    { key: 'events', label: 'Eventos', value: String(kpis.value.events), meta: 'nos últimos 7 dias', icon: 'calendar', to: { name: 'events' } },
    { key: 'treasury', label: 'Tesouraria', value: toGold(kpis.value.treasury), meta: 'saldo atual', icon: 'coins', to: { name: 'treasury' }, accent: true },
    { key: 'builds', label: 'Builds', value: String(kpis.value.builds), meta: 'montadas', icon: 'hammer', to: { name: 'builds' } },
  ]
  return all.filter((k) => widgets.value[k.key])
})

onMounted(() => {
  loadWidgetPreferences()
  load()
})

watch(treasuryRange, async () => {
  if (!guild.value) return
  try {
    treasuryHistoryData.value = await FinanceApi.dailyHistory(guild.value.id, rangeDays(treasuryRange.value))
  } catch {
    treasuryHistoryData.value = []
  }
})

function loadWidgetPreferences() {
  try {
    const saved = localStorage.getItem('dashboard_widgets')
    if (saved) widgets.value = { ...DEFAULT_WIDGETS, ...JSON.parse(saved) }
  } catch {
    // Preferências inválidas: usa o padrão
  }
}

function saveWidgets() {
  try {
    localStorage.setItem('dashboard_widgets', JSON.stringify(widgets.value))
  } catch {
    // Storage indisponível
  }
  showCustomizeModal.value = false
}

function resetWidgets() {
  widgets.value = { ...DEFAULT_WIDGETS }
}

async function load() {
  loading.value = true
  err.value = ''
  try {
    guild.value = auth.guild
    if (!guild.value) {
      members.value = []
      events.value = []
      kpis.value = { members: 0, events: 0, treasury: 0, builds: 0 }
      return
    }

    const [memb, evs, fin, buildsRes, history] = await Promise.all([
      MembersApi.listByGuild(guild.value.id),
      EventsApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      BuildsApi.list({ guildId: guild.value.id }),
      FinanceApi.dailyHistory?.(guild.value.id, rangeDays(treasuryRange.value)) ?? [],
    ])

    members.value = memb ?? []
    events.value = evs ?? []
    recentBuilds.value = (buildsRes as any[])?.slice(0, 6) ?? []
    treasuryHistoryData.value = history ?? []
    kpis.value = {
      members: members.value.length,
      events: countEventsInLastDays(events.value, 7),
      treasury: fin?.balance ?? 0,
      builds: (buildsRes as any[])?.length ?? 0,
    }
  } catch (e) {
    err.value = friendlyError(e)
  } finally {
    loading.value = false
  }
}

// ---------- Séries ----------
function rangeDays(range: Range): number {
  return range === '7d' ? 7 : 30
}

const eventSeries = computed(() => {
  const days = rangeDays(eventRange.value)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))

  const buckets = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    buckets.set(dayKey(d), 0)
  }
  for (const ev of events.value) {
    const d = new Date(ev.date)
    if (Number.isNaN(d.getTime())) continue
    const key = dayKey(d)
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1)
  }
  return [...buckets].map(([key, value]) => {
    const d = new Date(`${key}T12:00:00`)
    return {
      value,
      label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      short: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }
  })
})

const eventsInRange = computed(() => eventSeries.value.reduce((sum, p) => sum + p.value, 0))

const treasurySeries = computed(() =>
  treasuryHistoryData.value.map((d) => {
    const date = new Date(d.date)
    return {
      value: d.balance,
      label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
      short: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }
  }),
)

const treasuryDelta = computed(() => {
  const s = treasuryHistoryData.value
  return s.length >= 2 ? s[s.length - 1].balance - s[0].balance : null
})

const upcoming = computed(() => {
  const now = Date.now()
  return [...events.value]
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 6)
})

// ---------- Formatação ----------
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toGold(n: number) {
  return `${new Intl.NumberFormat('pt-BR').format(n)}g`
}

function formatEvents(n: number) {
  return `${n} ${n === 1 ? 'evento' : 'eventos'}`
}

function dayOfMonth(iso: string) {
  return new Date(iso).getDate().toString().padStart(2, '0')
}

function monthShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function weekdayTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

function eventTypeLabel(type: string) {
  return EVENT_TYPES[type] ?? type
}

function countEventsInLastDays(list: EventItem[], days: number) {
  const now = Date.now()
  const cutoff = now - days * 86_400_000
  // Só eventos já realizados no período (os futuros aparecem em "Próximos eventos")
  return list.filter((e) => {
    const t = new Date(e.date).getTime()
    return t >= cutoff && t <= now
  }).length
}

function initial(m: Member) {
  return (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase()
}

function roleLabel(role: string) {
  switch (role?.toLowerCase()) {
    case 'leader':
    case 'líder':
      return 'Líder'
    case 'officer':
      return 'Oficial'
    default:
      return 'Membro'
  }
}

function roleBadge(role: string) {
  const r = role?.toLowerCase()
  if (r === 'leader' || r === 'líder') return 'badge-gold'
  if (r === 'officer') return 'badge-info'
  return 'badge-neutral'
}
</script>
