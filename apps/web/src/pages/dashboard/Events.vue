<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl"
  >
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
          Eventos
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Organize e acompanhe os eventos da sua guilda
        </p>
      </div>
      <button
        @click="showForm = !showForm"
        class="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105 transition-all duration-300"
      >
        <svg v-if="!showForm" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        {{ showForm ? 'Fechar' : 'Novo Evento' }}
      </button>
    </div>

    <!-- FORM NOVO EVENTO -->
    <div v-if="showForm" class="mb-6 p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <h3 class="text-lg font-bold text-slate-50 mb-4">Criar Novo Evento</h3>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <input
          v-model="form.title"
          type="text"
          placeholder="Título do evento"
          class="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all md:col-span-2"
        />
        <input
          v-model="form.description"
          type="text"
          placeholder="Descrição (opcional)"
          class="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all md:col-span-2"
        />
        <select
          v-model="form.type"
          class="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
        >
          <option value="GATHERING">Reunião</option>
          <option value="RAID">Raid</option>
          <option value="DUNGEON">Dungeon</option>
          <option value="PVP">PvP</option>
        </select>
        <input
          v-model="form.date"
          type="date"
          :min="minDate"
          class="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
        />
        <input
          v-model="form.time"
          type="time"
          class="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
        />
        <input
          v-model="form.location"
          type="text"
          placeholder="Local (opcional)"
          class="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
        />
        <button
          @click="createEvent"
          :disabled="creating || !form.title || !form.date || !form.time || !guild"
          class="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
        >
          {{ creating ? 'Criando...' : 'Criar Evento' }}
        </button>
      </div>
      <p v-if="error" class="mt-3 flex items-center gap-2 text-sm text-rose-300">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        {{ error }}
      </p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-8 text-slate-400">
      <div class="inline-block h-8 w-8 border-4 border-[#C6A95D]/30 border-t-[#C6A95D] rounded-full animate-spin"></div>
      <p class="mt-3">Carregando eventos...</p>
    </div>

    <!-- LISTA DE EVENTOS -->
    <div v-else-if="events.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="ev in events"
        :key="ev.id"
        class="group p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-emerald-500/50 transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-3">
          <span
            class="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border"
            :class="getTypeStyle(ev.type)"
          >
            {{ getTypeLabel(ev.type) }}
          </span>
          <div
            class="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40"
          >
            <span class="text-sm font-bold text-emerald-300">
              {{ getDayOfMonth(ev.date) }}
            </span>
            <span class="text-[9px] text-slate-400 uppercase">
              {{ getMonth(ev.date) }}
            </span>
          </div>
        </div>

        <h3 class="text-lg font-bold text-slate-50 mb-2 group-hover:text-emerald-300 transition-colors">
          {{ ev.title }}
        </h3>

        <div class="space-y-2 text-sm text-slate-400 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            {{ formatDateTime(ev.date) }}
          </div>
          <div v-if="ev.location" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
            {{ ev.location }}
          </div>
        </div>

        <!-- Participantes -->
        <div v-if="hasParticipants(ev)" class="flex items-center gap-2 mb-4">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            {{ confirmedCount(ev) }} confirmados
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-semibold">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            {{ totalCount(ev) }} inscritos
          </div>
        </div>

        <button
          @click="finishEvent(ev.id)"
          :disabled="deleting === ev.id"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-500/50 bg-rose-500/10 text-rose-300 font-semibold text-sm hover:bg-rose-500/20 hover:border-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          {{ deleting === ev.id ? 'Finalizando...' : 'Finalizar Evento' }}
        </button>
      </article>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="text-center py-12">
      <div class="flex justify-center mb-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
          <svg class="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
      <h3 class="text-lg font-bold text-slate-200 mb-2">Nenhum evento agendado</h3>
      <p class="text-sm text-slate-400 mb-4">
        Crie o primeiro evento para começar a organizar as atividades da sua guilda
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { auth } from '@/stores/auth'
import { EventsApi } from '@/lib/api'

type Participant = { id?: number; status?: 'confirmed' | 'declined' | 'pending'; user?: any }
type EventItem = {
  id: number
  title: string
  description?: string
  date: string
  type: string
  location?: string
  participants?: Participant[]
}

const guild = ref<any>(null)
const events = ref<EventItem[]>([])
const loading = ref(true)
const error = ref('')

const showForm = ref(false)
const creating = ref(false)
const deleting = ref<number | null>(null)

const form = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  type: 'GATHERING' as 'RAID' | 'GATHERING' | 'DUNGEON' | 'PVP',
  location: '',
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    // Usa a guilda do usuário autenticado
    guild.value = auth.guild
    if (!guild.value) {
      events.value = []
      return
    }

    const all = await EventsApi.listByGuild(guild.value.id)
    const now = Date.now()
    events.value = all
      .filter((e: any) => new Date(e.date).getTime() >= now)
      .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date))
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Falha ao carregar eventos'
  } finally {
    loading.value = false
  }
}

function toISO(date: string, time: string) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const local = new Date(y, m - 1, d, hh, mm, 0)
  return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString()
}

const today = new Date()
today.setHours(0, 0, 0, 0)
const minDate = today.toISOString().slice(0, 10)

async function createEvent() {
  if (!guild.value) return
  creating.value = true
  error.value = ''
  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description?.trim() || 'Evento da guilda',
      date: toISO(form.value.date, form.value.time),
      type: form.value.type,
      location: form.value.location?.trim() || undefined,
      guildId: guild.value.id,
    }
    await EventsApi.create(payload)
    showForm.value = false
    form.value = { title: '', description: '', date: '', time: '', type: 'GATHERING', location: '' }
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Falha ao criar evento'
  } finally {
    creating.value = false
  }
}

async function finishEvent(eventId: number) {
  if (!confirm('Tem certeza que deseja finalizar este evento?')) return

  deleting.value = eventId
  error.value = ''
  try {
    await EventsApi.remove(eventId)
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Falha ao finalizar evento'
  } finally {
    deleting.value = null
  }
}

function hasParticipants(ev: EventItem) {
  return Array.isArray(ev.participants) && ev.participants.length > 0
}

function totalCount(ev: EventItem) {
  return Array.isArray(ev.participants) ? ev.participants.length : 0
}

function confirmedCount(ev: EventItem) {
  return Array.isArray(ev.participants)
    ? ev.participants.filter((p) => p.status === 'confirmed').length
    : 0
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function getDayOfMonth(iso: string) {
  try {
    return new Date(iso).getDate().toString().padStart(2, '0')
  } catch {
    return '?'
  }
}

function getMonth(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { month: 'short' })
  } catch {
    return '?'
  }
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    GATHERING: 'Reunião',
    RAID: 'Raid',
    DUNGEON: 'Dungeon',
    PVP: 'PvP',
  }
  return labels[type] || type
}

function getTypeStyle(type: string) {
  const styles: Record<string, string> = {
    GATHERING: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    RAID: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    DUNGEON: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    PVP: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  }
  return styles[type] || 'bg-slate-700/50 text-slate-300 border-slate-600'
}
</script>
