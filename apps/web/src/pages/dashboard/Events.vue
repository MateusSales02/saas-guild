<template>
  <section class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Eventos</h2>
      <button
        @click="showForm = !showForm"
        class="text-sm px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800"
      >
        {{ showForm ? 'Fechar' : 'Novo evento' }}
      </button>
    </div>

    <div v-if="showForm" class="mb-5 grid gap-3 md:grid-cols-4">
      <input v-model="form.name" type="text" placeholder="Nome do evento"
        class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none" />
      <input v-model="form.description" type="text" placeholder="Descrição (opcional)"
        class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none md:col-span-2" />
      <div class="grid grid-cols-2 gap-3 md:col-span-2">
        <input v-model="form.date" type="date"
          class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none" />
        <input v-model="form.time" type="time"
          class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none" />
      </div>
      <label class="flex items-center gap-2">
        <input v-model="form.recurring" type="checkbox" class="accent-blue-500" />
        Recorrente
      </label>
      <button
        @click="createEvent"
        :disabled="creating || !form.name || !form.date || !form.time || !guild"
        class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {{ creating ? 'Criando...' : 'Criar' }}
      </button>
      <p v-if="error" class="text-sm text-red-400 md:col-span-4">{{ error }}</p>
    </div>

    <div v-if="loading" class="opacity-80">Carregando eventos…</div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <article
        v-for="ev in events"
        :key="ev.id"
        class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/40"
      >
        <div class="text-xs uppercase opacity-60">{{ ev.recurring ? 'Recorrente' : 'Único' }}</div>
        <div class="mt-1 font-medium">{{ ev.name }}</div>
        <div class="text-xs opacity-70">
          {{ formatDate(ev.event_date) }}
        </div>

        <div class="mt-3 flex items-center gap-2">
          <button
            @click="rsvp(ev.id, 'confirmed')"
            class="text-xs px-3 py-1 rounded border border-green-600 hover:bg-green-700"
          >
            Confirmar presença
          </button>
          <button
            @click="rsvp(ev.id, 'declined')"
            class="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700"
          >
            Não vou
          </button>
        </div>
      </article>
    </div>

    <div v-if="!loading && events.length === 0" class="opacity-70">
      Nenhum evento ainda. Crie o primeiro no botão acima.
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GuildsApi, EventsApi } from '@/lib/api'
import { auth } from '@/stores/auth'

type EventItem = {
  id: number
  name: string
  description?: string
  event_date: string
  recurring: boolean
}

const guild = ref<any>(null)
const events = ref<EventItem[]>([])
const loading = ref(true)
const error = ref('')

const showForm = ref(false)
const creating = ref(false)
const form = ref({
  name: '',
  description: '',
  date: '', 
  time: '', 
  recurring: false,
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const guilds = await GuildsApi.list()
    guild.value = guilds?.[0] ?? null 
    if (!guild.value) {
      events.value = []
      return
    }
    events.value = await EventsApi.listByGuild(guild.value.id)
  } catch (e: any) {
    error.value = e.message || 'Falha ao carregar eventos'
  } finally {
    loading.value = false
  }
}

function toISO(date: string, time: string) {
  const iso = new Date(`${date}T${time}:00`).toISOString()
  return iso
}

async function createEvent() {
  if (!guild.value) return
  creating.value = true
  error.value = ''
  try {
    const payload = {
      guildId: guild.value.id,
      name: form.value.name.trim(),
      description: form.value.description?.trim() || undefined,
      event_date: toISO(form.value.date, form.value.time),
      recurring: form.value.recurring,
    }
    await EventsApi.create(payload)
    showForm.value = false
    // limpa form
    form.value = { name: '', description: '', date: '', time: '', recurring: false }
    await load()
  } catch (e: any) {
    error.value = e.message || 'Falha ao criar evento'
  } finally {
    creating.value = false
  }
}

async function rsvp(eventId: number, status: 'confirmed' | 'declined' | 'pending') {
  if (!auth.user?.id) {
    error.value = 'Você precisa estar logado'
    return
  }
  try {
    await EventsApi.rsvp(eventId, auth.user.id, status)
  } catch (e: any) {
    error.value = e.message || 'Falha ao registrar presença'
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}
</script>
