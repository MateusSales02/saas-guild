<template>
  <div class="page">
    <PageHeader
      :eyebrow="guild?.name ?? 'Guilda'"
      title="Eventos"
      subtitle="A agenda da guilda: raids, dungeons, coleta e PvP."
    >
      <template #actions>
        <button type="button" class="btn btn-primary" :disabled="!guild" @click="openModal">
          <AppIcon name="plus" :size="16" />
          Novo evento
        </button>
      </template>
    </PageHeader>

    <div v-if="loadError" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ loadError }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="load">Tentar novamente</button>
    </div>

    <!-- Filtro por tipo -->
    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por tipo">
      <button type="button" class="chip" :aria-pressed="typeFilter === 'ALL'" @click="typeFilter = 'ALL'">
        Todos <span class="text-slate-500">{{ events.length }}</span>
      </button>
      <button
        v-for="t in TYPES"
        :key="t.value"
        type="button"
        class="chip"
        :aria-pressed="typeFilter === t.value"
        @click="typeFilter = t.value"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="t.dot" />
        {{ t.label }}
        <span class="text-slate-500">{{ countByType[t.value] ?? 0 }}</span>
      </button>
    </div>

    <!-- Carregando -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 2" :key="i" class="panel p-5 space-y-3">
        <div class="skeleton h-3 w-24" />
        <div class="skeleton h-14" />
        <div class="skeleton h-14" />
      </div>
    </div>

    <div v-else-if="filtered.length === 0" class="panel">
      <EmptyState
        icon="calendar"
        :title="events.length ? 'Nenhum evento deste tipo' : 'Nenhum evento agendado'"
        :text="events.length ? 'Escolha outro filtro para ver mais eventos.' : 'Crie o primeiro evento para organizar as atividades da guilda.'"
      >
        <button v-if="!events.length && guild" type="button" class="btn btn-secondary btn-sm" @click="openModal">
          <AppIcon name="plus" :size="14" /> Novo evento
        </button>
      </EmptyState>
    </div>

    <!-- Agenda agrupada por dia -->
    <div v-else class="space-y-6">
      <section v-for="group in grouped" :key="group.key">
        <h2 class="mb-2 flex items-baseline gap-2 px-1">
          <span class="text-sm font-semibold text-slate-100">{{ group.title }}</span>
          <span class="text-xs text-slate-500">{{ group.subtitle }}</span>
        </h2>
        <ul class="panel divide-y divide-white/[0.04] overflow-hidden">
          <li v-for="ev in group.items" :key="ev.id" class="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.015] sm:flex-row sm:items-center">
            <div class="flex w-20 shrink-0 items-center gap-3 sm:block">
              <p class="text-lg font-semibold tabular-nums text-slate-50">{{ time(ev.date) }}</p>
              <p class="text-[11px] text-slate-500">{{ relative(ev.date) }}</p>
            </div>
            <span class="hidden h-10 w-px bg-white/[0.06] sm:block" aria-hidden="true" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="badge" :class="typeMeta(ev.type).badge">{{ typeMeta(ev.type).label }}</span>
                <span v-if="ev.is_recurring && !ev.parent_event_id" class="badge badge-gold" :title="`Repete ${recurrenceLabel(ev).toLowerCase()}`">
                  <AppIcon name="refresh" :size="10" /> {{ recurrenceLabel(ev) }}
                </span>
                <span v-if="ev.parent_event_id" class="badge badge-neutral" title="Ocorrência gerada automaticamente">Recorrência</span>
              </div>
              <p class="mt-1.5 truncate font-medium text-slate-100">{{ ev.title }}</p>
              <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <span v-if="ev.location" class="flex items-center gap-1"><AppIcon name="map" :size="12" /> {{ ev.location }}</span>
                <span v-if="ev.description && ev.description !== 'Evento da guilda'" class="truncate">{{ ev.description }}</span>
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div v-if="totalCount(ev)" class="text-right text-xs">
                <p class="font-semibold tabular-nums text-slate-200">{{ confirmedCount(ev) }}<span class="text-slate-500">/{{ totalCount(ev) }}</span></p>
                <p class="text-slate-500">confirmados</p>
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-sm opacity-70 group-hover:opacity-100"
                :disabled="deleting === ev.id"
                :aria-label="`Finalizar ${ev.title}`"
                @click="finishEvent(ev)"
              >
                <AppIcon name="check" :size="15" />
                <span class="hidden md:inline">Finalizar</span>
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- MODAL: Novo evento -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-backdrop" @mousedown.self="closeModal" @keydown.esc="closeModal">
        <form class="modal-panel max-w-xl" role="dialog" aria-modal="true" aria-labelledby="event-form-title" @submit.prevent="createEvent">
          <header class="panel-header">
            <div>
              <h2 id="event-form-title" class="section-title">Novo evento</h2>
              <p class="panel-subtitle">Aparece na agenda e no painel da guilda</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="closeModal">
              <AppIcon name="x" />
            </button>
          </header>

          <div class="space-y-4 p-5">
            <div>
              <p class="label">Tipo</p>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Tipo do evento">
                <button
                  v-for="t in TYPES"
                  :key="t.value"
                  type="button"
                  role="radio"
                  :aria-checked="form.type === t.value"
                  class="inset flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/20"
                  :class="{ '!border-gold-500/50 !bg-gold-500/[0.07] !text-gold-100': form.type === t.value }"
                  @click="form.type = t.value"
                >
                  <span class="h-2 w-2 rounded-full" :class="t.dot" /> {{ t.label }}
                </button>
              </div>
            </div>

            <div>
              <label for="ev-title" class="label">Título</label>
              <input id="ev-title" ref="titleInput" v-model="form.title" type="text" required maxlength="80" placeholder="Ex: ZvZ territorial" class="input" />
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label for="ev-date" class="label">Data</label>
                <input id="ev-date" v-model="form.date" type="date" required :min="minDate" class="input" />
              </div>
              <div>
                <label for="ev-time" class="label">Hora</label>
                <input id="ev-time" v-model="form.time" type="time" required class="input" />
              </div>
              <div>
                <label for="ev-location" class="label">Local</label>
                <input id="ev-location" v-model="form.location" type="text" list="event-locations" placeholder="Opcional" class="input" />
                <datalist id="event-locations">
                  <option v-for="c in LOCATIONS" :key="c" :value="c" />
                </datalist>
              </div>
            </div>

            <div>
              <label for="ev-desc" class="label">Descrição <span class="text-slate-600">(opcional)</span></label>
              <textarea id="ev-desc" v-model="form.description" rows="2" maxlength="200" class="textarea" placeholder="Requisitos, ponto de encontro, build sugerida..." />
            </div>

            <div class="inset p-4">
              <label class="check font-medium">
                <input v-model="form.is_recurring" type="checkbox" />
                Repetir este evento
              </label>
              <div v-if="form.is_recurring" class="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label for="ev-pattern" class="label">Frequência</label>
                  <select id="ev-pattern" v-model="form.recurrence_pattern" class="select">
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                <div>
                  <label for="ev-interval" class="label">A cada</label>
                  <div class="flex items-center gap-2">
                    <input id="ev-interval" v-model.number="form.recurrence_interval" type="number" min="1" max="30" class="input w-20" />
                    <span class="text-xs text-slate-500">{{ unitLabel }}</span>
                  </div>
                </div>
                <div>
                  <label for="ev-end" class="label">Termina em</label>
                  <input id="ev-end" v-model="form.recurrence_end_date" type="date" :min="form.date || minDate" class="input" />
                </div>
              </div>
            </div>

            <p v-if="formError" role="alert" class="alert alert-error">{{ formError }}</p>
          </div>

          <footer class="flex justify-end gap-2 border-t border-white/[0.06] p-4">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="creating || !form.title.trim() || !form.date || !form.time">
              <span v-if="creating" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
              {{ creating ? 'Criando...' : 'Criar evento' }}
            </button>
          </footer>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { EventsApi } from '@/lib/api'
import { friendlyError } from '@/lib/errors'
import { confirmAction, toast } from '@/lib/toast'
import { auth } from '@/stores/auth'

type EventType = 'RAID' | 'GATHERING' | 'DUNGEON' | 'PVP'
type Participant = { id?: number; status?: 'confirmed' | 'declined' | 'pending'; user?: any }
type EventItem = {
  id: number
  title: string
  description?: string
  date: string
  type: string
  location?: string
  participants?: Participant[]
  is_recurring?: boolean
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly'
  recurrence_interval?: number
  parent_event_id?: number | null
}

const TYPES: Array<{ value: EventType; label: string; dot: string; badge: string }> = [
  { value: 'RAID', label: 'Raid', dot: 'bg-rose-400', badge: 'badge-danger' },
  { value: 'DUNGEON', label: 'Dungeon', dot: 'bg-violet-400', badge: 'badge-info' },
  { value: 'PVP', label: 'PvP', dot: 'bg-amber-400', badge: 'badge-warning' },
  { value: 'GATHERING', label: 'Reunião', dot: 'bg-emerald-400', badge: 'badge-success' },
]
const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Brecilien', 'Roads of Avalon', 'Mists', 'Discord']

const emptyForm = () => ({
  title: '',
  description: '',
  date: '',
  time: '20:00',
  type: 'GATHERING' as EventType,
  location: '',
  is_recurring: false,
  recurrence_pattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
  recurrence_interval: 1,
  recurrence_end_date: '',
})

const guild = computed(() => auth.guild)
const events = ref<EventItem[]>([])
const loading = ref(true)
const loadError = ref('')
const typeFilter = ref<EventType | 'ALL'>('ALL')

const showForm = ref(false)
const creating = ref(false)
const formError = ref('')
const deleting = ref<number | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)
const form = ref(emptyForm())

const minDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const unitLabel = computed(() => {
  const n = form.value.recurrence_interval || 1
  if (form.value.recurrence_pattern === 'daily') return n === 1 ? 'dia' : 'dias'
  if (form.value.recurrence_pattern === 'weekly') return n === 1 ? 'semana' : 'semanas'
  return n === 1 ? 'mês' : 'meses'
})

const countByType = computed(() => {
  const counts: Record<string, number> = {}
  for (const e of events.value) counts[e.type] = (counts[e.type] ?? 0) + 1
  return counts
})

const filtered = computed(() =>
  typeFilter.value === 'ALL' ? events.value : events.value.filter((e) => e.type === typeFilter.value),
)

/** Agrupa por dia: "Hoje", "Amanhã", "Sexta-feira" ... */
const grouped = computed(() => {
  const groups = new Map<string, { key: string; title: string; subtitle: string; items: EventItem[] }>()
  for (const ev of filtered.value) {
    const d = new Date(ev.date)
    const key = d.toDateString()
    if (!groups.has(key)) groups.set(key, { key, ...dayTitle(d), items: [] })
    groups.get(key)!.items.push(ev)
  }
  return [...groups.values()]
})

onMounted(load)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    if (!guild.value) {
      events.value = []
      return
    }
    const all: EventItem[] = (await EventsApi.listByGuild(guild.value.id)) ?? []
    const now = Date.now()
    events.value = all
      .filter((e) => new Date(e.date).getTime() >= now)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
  } catch (e) {
    loadError.value = friendlyError(e, 'Não foi possível carregar os eventos.')
  } finally {
    loading.value = false
  }
}

function openModal() {
  form.value = emptyForm()
  formError.value = ''
  showForm.value = true
  nextTick(() => titleInput.value?.focus())
}

function closeModal() {
  if (!creating.value) showForm.value = false
}

/** Data/hora locais → ISO em UTC (o horário que o jogador digitou é o que aparece depois) */
function toISO(date: string, time: string) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0).toISOString()
}

async function createEvent() {
  if (!guild.value) return
  creating.value = true
  formError.value = ''
  try {
    const payload: any = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || 'Evento da guilda',
      date: toISO(form.value.date, form.value.time),
      type: form.value.type,
      location: form.value.location.trim() || undefined,
      guildId: guild.value.id,
    }
    if (form.value.is_recurring) {
      payload.is_recurring = true
      payload.recurrence_pattern = form.value.recurrence_pattern
      payload.recurrence_interval = form.value.recurrence_interval || 1
      if (form.value.recurrence_end_date) payload.recurrence_end_date = form.value.recurrence_end_date
    }
    await EventsApi.create(payload)
    showForm.value = false
    toast('Evento criado', { text: payload.title })
    await load()
  } catch (e) {
    formError.value = friendlyError(e, 'Não foi possível criar o evento.')
  } finally {
    creating.value = false
  }
}

async function finishEvent(ev: EventItem) {
  const ok = await confirmAction({
    title: `Finalizar "${ev.title}"?`,
    text: 'O evento sai da agenda da guilda.',
    confirmLabel: 'Finalizar evento',
  })
  if (!ok) return
  deleting.value = ev.id
  try {
    await EventsApi.remove(ev.id)
    events.value = events.value.filter((e) => e.id !== ev.id)
    toast('Evento finalizado')
  } catch (e) {
    toast('Não foi possível finalizar', { tone: 'error', text: friendlyError(e) })
  } finally {
    deleting.value = null
  }
}

function totalCount(ev: EventItem) {
  return Array.isArray(ev.participants) ? ev.participants.length : 0
}

function confirmedCount(ev: EventItem) {
  return Array.isArray(ev.participants) ? ev.participants.filter((p) => p.status === 'confirmed').length : 0
}

function typeMeta(type: string) {
  return TYPES.find((t) => t.value === type) ?? { label: type, badge: 'badge-neutral' }
}

function recurrenceLabel(ev: EventItem) {
  const n = ev.recurrence_interval || 1
  switch (ev.recurrence_pattern) {
    case 'daily':
      return n === 1 ? 'Diário' : `A cada ${n} dias`
    case 'weekly':
      return n === 1 ? 'Semanal' : `A cada ${n} semanas`
    case 'monthly':
      return n === 1 ? 'Mensal' : `A cada ${n} meses`
    default:
      return 'Recorrente'
  }
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function relative(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  const hours = Math.round(diff / 3_600_000)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(diff / 86_400_000), 'day')
}

function dayTitle(d: Date) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - start.getTime()) / 86_400_000)
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' })
  if (days === 0) return { title: 'Hoje', subtitle: `${weekday}, ${date}` }
  if (days === 1) return { title: 'Amanhã', subtitle: `${weekday}, ${date}` }
  return { title: weekday.charAt(0).toUpperCase() + weekday.slice(1), subtitle: date }
}
</script>
