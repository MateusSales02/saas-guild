<template>
  <div class="page">
    <PageHeader
      :eyebrow="guild?.name ?? 'Guilda'"
      title="Raids"
      subtitle="Organize as incursões da guilda e acompanhe quem vai participar."
    >
      <template #actions>
        <button type="button" class="btn btn-primary" @click="openModal">
          <AppIcon name="plus" :size="16" />
          Agendar raid
        </button>
      </template>
    </PageHeader>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="loadRaids">Tentar novamente</button>
    </div>

    <!-- Destaque: próxima raid -->
    <section v-if="!loading && nextRaid" class="panel relative overflow-hidden">
      <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />
      <div class="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <DateTile :date="nextRaid.date" large />
        <div class="min-w-0 flex-1">
          <p class="eyebrow">Próxima raid · {{ relative(nextRaid.date) }}</p>
          <h2 class="mt-1 font-display text-xl font-semibold tracking-wide text-slate-50">{{ nextRaid.title }}</h2>
          <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span class="flex items-center gap-1.5"><AppIcon name="clock" :size="14" /> {{ fullDate(nextRaid.date) }}</span>
            <span v-if="nextRaid.location" class="flex items-center gap-1.5"><AppIcon name="map" :size="14" /> {{ nextRaid.location }}</span>
          </p>
          <p v-if="nextRaid.description" class="mt-2 text-sm text-slate-500">{{ nextRaid.description }}</p>
        </div>
        <Participants :list="nextRaid.participants" />
      </div>
    </section>

    <section class="panel overflow-hidden">
      <header class="panel-header">
        <div class="seg" role="tablist" aria-label="Raids">
          <button type="button" role="tab" class="seg-item" :aria-selected="tab === 'upcoming'" @click="tab = 'upcoming'">
            Próximas <span class="ml-1 text-slate-500">{{ upcoming.length }}</span>
          </button>
          <button type="button" role="tab" class="seg-item" :aria-selected="tab === 'past'" @click="tab = 'past'">
            Realizadas <span class="ml-1 text-slate-500">{{ past.length }}</span>
          </button>
        </div>
      </header>

      <div v-if="loading" class="divide-y divide-white/[0.04]">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-5 py-4">
          <div class="skeleton h-12 w-12" />
          <div class="flex-1 space-y-2">
            <div class="skeleton h-3.5 w-48" />
            <div class="skeleton h-3 w-64" />
          </div>
        </div>
      </div>

      <EmptyState
        v-else-if="visible.length === 0"
        icon="swords"
        :title="tab === 'upcoming' ? 'Nenhuma raid agendada' : 'Nenhuma raid realizada ainda'"
        :text="tab === 'upcoming' ? 'Agende a próxima incursão e avise a guilda.' : 'As raids concluídas aparecem aqui.'"
      >
        <button v-if="tab === 'upcoming'" type="button" class="btn btn-secondary btn-sm" @click="openModal">
          <AppIcon name="plus" :size="14" /> Agendar raid
        </button>
      </EmptyState>

      <ul v-else class="divide-y divide-white/[0.04]">
        <li v-for="r in visible" :key="r.id" class="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.015]">
          <DateTile :date="r.date" :muted="tab === 'past'" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-slate-100">{{ r.title }}</p>
            <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
              <span>{{ weekdayTime(r.date) }}</span>
              <template v-if="r.location"><span aria-hidden="true">·</span><span>{{ r.location }}</span></template>
              <template v-if="r.description"><span aria-hidden="true">·</span><span class="truncate">{{ r.description }}</span></template>
            </p>
          </div>
          <span v-if="tab === 'upcoming'" class="hidden badge badge-gold sm:inline-flex">{{ relative(r.date) }}</span>
          <Participants :list="r.participants" compact />
          <button
            type="button"
            class="btn btn-ghost btn-icon btn-sm opacity-60 hover:!text-rose-300 group-hover:opacity-100"
            :aria-label="`Remover ${r.title}`"
            @click="removeRaid(r)"
          >
            <AppIcon name="trash" :size="15" />
          </button>
        </li>
      </ul>
    </section>

    <!-- MODAL: Agendar raid -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-backdrop" @mousedown.self="closeModal" @keydown.esc="closeModal">
        <form class="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="raid-title" @submit.prevent="createRaid">
          <header class="panel-header">
            <div>
              <h2 id="raid-title" class="section-title">Agendar raid</h2>
              <p class="panel-subtitle">Aparece na agenda e no painel da guilda</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="closeModal">
              <AppIcon name="x" />
            </button>
          </header>

          <div class="space-y-4 p-5">
            <div>
              <label for="raid-name" class="label">Nome da raid</label>
              <input id="raid-name" ref="titleInput" v-model="newRaid.title" type="text" required maxlength="80" placeholder="Ex: Dungeon Avaloniana T8" class="input" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="raid-date" class="label">Data e hora</label>
                <input id="raid-date" v-model="newRaid.date" type="datetime-local" required class="input" />
              </div>
              <div>
                <label for="raid-location" class="label">Local <span class="text-slate-600">(opcional)</span></label>
                <input id="raid-location" v-model="newRaid.location" type="text" list="albion-locations" placeholder="Ex: Fort Sterling" class="input" />
                <datalist id="albion-locations">
                  <option v-for="c in LOCATIONS" :key="c" :value="c" />
                </datalist>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button v-for="p in QUICK_TIMES" :key="p.label" type="button" class="chip" @click="newRaid.date = p.value()">
                {{ p.label }}
              </button>
            </div>
            <div>
              <label for="raid-desc" class="label">Observações <span class="text-slate-600">(opcional)</span></label>
              <textarea id="raid-desc" v-model="newRaid.description" rows="2" maxlength="200" placeholder="Requisitos de IP, consumíveis, ponto de encontro..." class="textarea" />
            </div>
            <p v-if="createError" role="alert" class="alert alert-error">{{ createError }}</p>
          </div>

          <footer class="flex justify-end gap-2 border-t border-white/[0.06] p-4">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving || !newRaid.title.trim() || !newRaid.date">
              <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
              {{ saving ? 'Agendando...' : 'Agendar' }}
            </button>
          </footer>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, ref, type PropType } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { EventsApi } from '@/lib/api'
import { friendlyError } from '@/lib/errors'
import { confirmAction, toast } from '@/lib/toast'
import { auth } from '@/stores/auth'

interface Participant {
  userId: number
  status?: string
  user?: { nickname?: string; email?: string }
}

interface Raid {
  id: number
  title: string
  description?: string
  date: string
  type: string
  location?: string
  participants?: Participant[]
}

const LOCATIONS = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Brecilien', 'Roads of Avalon', 'Mists']

/** Atalhos de horário: hoje/amanhã às 20h, próximo sábado às 21h */
const QUICK_TIMES = [
  { label: 'Hoje 20h', value: () => atTime(0, 20) },
  { label: 'Amanhã 20h', value: () => atTime(1, 20) },
  { label: 'Sábado 21h', value: () => atTime((6 - new Date().getDay() + 7) % 7 || 7, 21) },
]

/** Bloco de data (dia + mês) */
const DateTile = defineComponent({
  props: { date: { type: String, required: true }, large: Boolean, muted: Boolean },
  setup(props) {
    return () => {
      const d = new Date(props.date)
      return h(
        'div',
        {
          class: [
            'flex shrink-0 flex-col items-center justify-center rounded-xl border',
            props.large ? 'h-16 w-16' : 'h-12 w-12',
            props.muted ? 'border-white/[0.08] bg-white/[0.02]' : 'border-gold-500/25 bg-gold-500/[0.06]',
          ],
        },
        [
          h('span', { class: ['font-semibold leading-none tabular-nums', props.large ? 'text-2xl' : 'text-base', props.muted ? 'text-slate-400' : 'text-gold-200'] }, String(d.getDate()).padStart(2, '0')),
          h('span', { class: ['mt-1 text-[9px] font-semibold uppercase tracking-wider', props.muted ? 'text-slate-600' : 'text-gold-500/80'] }, d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')),
        ],
      )
    }
  },
})

/** Avatares empilhados dos participantes */
const Participants = defineComponent({
  props: { list: { type: Array as PropType<Participant[]>, default: () => [] }, compact: Boolean },
  setup(props) {
    return () => {
      const list = props.list ?? []
      if (!list.length) return h('span', { class: 'hidden text-xs text-slate-600 sm:inline' }, 'Sem confirmações')
      const shown = list.slice(0, props.compact ? 3 : 5)
      return h('div', { class: 'flex items-center gap-2', title: list.map((p) => p.user?.nickname ?? '').join(', ') }, [
        h(
          'div',
          { class: 'flex -space-x-2' },
          shown.map((p) =>
            h(
              'span',
              { class: 'flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink-900 bg-ink-600 text-[10px] font-semibold text-slate-200' },
              (p.user?.nickname ?? p.user?.email ?? '?').charAt(0).toUpperCase(),
            ),
          ),
        ),
        h('span', { class: 'whitespace-nowrap text-xs text-slate-500' }, `${list.length} ${list.length === 1 ? 'confirmado' : 'confirmados'}`),
      ])
    }
  },
})

const raids = ref<Raid[]>([])
const loading = ref(true)
const error = ref('')
const tab = ref<'upcoming' | 'past'>('upcoming')
const showCreateModal = ref(false)
const saving = ref(false)
const createError = ref('')
const titleInput = ref<HTMLInputElement | null>(null)
const newRaid = ref({ title: '', description: '', date: '', location: '' })

const guild = computed(() => auth.guild)

const upcoming = computed(() =>
  raids.value.filter((r) => new Date(r.date).getTime() >= Date.now()).sort((a, b) => +new Date(a.date) - +new Date(b.date)),
)
const past = computed(() =>
  raids.value.filter((r) => new Date(r.date).getTime() < Date.now()).sort((a, b) => +new Date(b.date) - +new Date(a.date)),
)
const nextRaid = computed(() => upcoming.value[0] ?? null)
const visible = computed(() => (tab.value === 'upcoming' ? upcoming.value : past.value))

async function loadRaids() {
  if (!guild.value) {
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    const all = await EventsApi.listByGuild(guild.value.id)
    raids.value = (all ?? []).filter((e: Raid) => e.type === 'RAID')
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar as raids.')
  } finally {
    loading.value = false
  }
}

function openModal() {
  newRaid.value = { title: '', description: '', date: '', location: '' }
  createError.value = ''
  showCreateModal.value = true
  nextTick(() => titleInput.value?.focus())
}

function closeModal() {
  if (!saving.value) showCreateModal.value = false
}

async function createRaid() {
  if (!guild.value || !newRaid.value.title.trim() || !newRaid.value.date) return
  saving.value = true
  createError.value = ''
  try {
    await EventsApi.create({
      title: newRaid.value.title.trim(),
      description: newRaid.value.description.trim() || 'Raid de guilda',
      date: newRaid.value.date,
      type: 'RAID',
      location: newRaid.value.location.trim() || undefined,
      guildId: guild.value.id,
    })
    showCreateModal.value = false
    toast('Raid agendada', { text: `${newRaid.value.title} · ${fullDate(newRaid.value.date)}` })
    await loadRaids()
  } catch (e) {
    createError.value = friendlyError(e, 'Não foi possível agendar a raid.')
  } finally {
    saving.value = false
  }
}

async function removeRaid(raid: Raid) {
  const ok = await confirmAction({
    title: `Remover "${raid.title}"?`,
    text: 'A raid sai da agenda e as confirmações são perdidas.',
    confirmLabel: 'Remover raid',
    danger: true,
  })
  if (!ok) return
  try {
    await EventsApi.remove(raid.id)
    raids.value = raids.value.filter((r) => r.id !== raid.id)
    toast('Raid removida')
  } catch (e) {
    toast('Não foi possível remover', { tone: 'error', text: friendlyError(e) })
  }
}

// ---------- Datas ----------
function atTime(daysAhead: number, hour: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:00`
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
}

function weekdayTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

/** "em 3 horas", "amanhã", "há 2 dias" */
function relative(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  const hours = Math.round(diff / 3_600_000)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(diff / 86_400_000), 'day')
}

onMounted(loadRaids)
</script>
