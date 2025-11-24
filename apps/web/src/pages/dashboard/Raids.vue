<template>
  <section
    class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
  >
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">Raids</h2>
      <button
        @click="showCreateModal = true"
        class="text-sm px-3 py-1 rounded-lg bg-[#C6A95D] text-slate-900 hover:bg-[#D4B96E] transition"
      >
        Criar raid
      </button>
    </div>

    <p v-if="loading" class="text-sm opacity-70">Carregando raids...</p>
    <p v-else-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p v-else-if="raids.length === 0" class="text-sm opacity-70">
      Nenhuma raid criada ainda. Clique em "Criar raid" para começar!
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="r in raids"
        :key="r.id"
        class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3"
      >
        <div
          class="w-10 h-10 rounded-xl bg-[#C6A95D]/15 grid place-items-center text-[#C6A95D] font-bold"
        >
          {{ formatDay(r.date) }}
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium">{{ r.title }}</div>
          <div class="text-xs opacity-70">
            {{ formatDate(r.date) }} · {{ formatTime(r.date) }}
            <span v-if="r.description"> · {{ r.description }}</span>
          </div>
        </div>
        <button
          @click="removeRaid(r.id)"
          class="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
        >
          Remover
        </button>
      </li>
    </ul>

    <!-- Modal Criar Raid -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div
        class="bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-700"
      >
        <h3 class="text-xl font-bold mb-4 text-[#C6A95D]">Criar Nova Raid</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-1">Nome da Raid</label>
            <input
              v-model="newRaid.title"
              type="text"
              placeholder="Ex: Fortaleza de Aço"
              class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-[#C6A95D] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Descrição (opcional)</label>
            <input
              v-model="newRaid.description"
              type="text"
              placeholder="Ex: Boss final do calabouço"
              class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-[#C6A95D] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Data e Hora</label>
            <input
              v-model="newRaid.date"
              type="datetime-local"
              class="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-[#C6A95D] outline-none"
            />
          </div>
          <p v-if="createError" class="text-sm text-red-400">{{ createError }}</p>
          <div class="flex gap-2">
            <button
              @click="createRaid"
              :disabled="saving || !newRaid.title || !newRaid.date"
              class="flex-1 bg-[#C6A95D] text-slate-900 p-2 rounded-lg font-semibold hover:bg-[#D4B96E] transition disabled:opacity-50"
            >
              {{ saving ? 'Criando...' : 'Criar' }}
            </button>
            <button
              @click="showCreateModal = false"
              class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { EventsApi } from '@/lib/api'
import { auth } from '@/stores/auth'

interface Raid {
  id: number
  title: string
  description: string
  date: string
  type: string
  location?: string
  guild: { id: number; name: string }
}

const raids = ref<Raid[]>([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const saving = ref(false)
const createError = ref('')

const newRaid = ref({
  title: '',
  description: '',
  date: '',
})

const guild = computed(() => auth.guild)

async function loadRaids() {
  if (!guild.value) return

  loading.value = true
  error.value = ''
  try {
    const allEvents = await EventsApi.listByGuild(guild.value.id)
    // Filtra apenas eventos do tipo RAID
    raids.value = allEvents.filter((e: any) => e.type === 'RAID')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Erro ao carregar raids'
  } finally {
    loading.value = false
  }
}

async function createRaid() {
  if (!guild.value || !newRaid.value.title || !newRaid.value.date) return

  saving.value = true
  createError.value = ''
  try {
    await EventsApi.create({
      title: newRaid.value.title,
      description: newRaid.value.description || 'Raid de guilda',
      date: newRaid.value.date,
      type: 'RAID',
      location: undefined,
      guildId: guild.value.id,
    })

    showCreateModal.value = false
    newRaid.value = { title: '', description: '', date: '' }
    await loadRaids()
  } catch (e: any) {
    createError.value = e?.response?.data?.message ?? e?.message ?? 'Erro ao criar raid'
  } finally {
    saving.value = false
  }
}

async function removeRaid(id: number) {
  if (!confirm('Tem certeza que deseja remover esta raid?')) return

  try {
    await EventsApi.remove(id)
    await loadRaids()
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Erro ao remover raid'
  }
}

function formatDay(date: string): string {
  return new Date(date).getDate().toString().padStart(2, '0')
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadRaids()
})
</script>
