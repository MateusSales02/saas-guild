<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
  >
    <!-- HEADER -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-rose-500/30">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
            </svg>
          </div>
          Raids
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Organize ataques épicos e conquiste territórios com sua guilda.
        </p>
      </div>

      <button
        @click="showCreateModal = true"
        class="group inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg
               bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold
               shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105 transition-all duration-300"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
        </svg>
        Criar Raid
      </button>
    </header>

    <!-- ERRO -->
    <div
      v-if="error"
      class="mb-4 rounded-lg border border-rose-500/70 bg-rose-950/70 px-4 py-3 text-xs sm:text-sm text-rose-100 flex gap-2"
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <div>
        <p class="font-medium">Ocorreu um erro.</p>
        <p class="text-rose-200/90">{{ error }}</p>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-center gap-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/80 animate-pulse"
      >
        <div class="w-12 h-12 rounded-xl bg-slate-800/80" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-48 rounded bg-slate-800/80" />
          <div class="h-3 w-64 rounded bg-slate-900/90" />
        </div>
        <div class="h-8 w-20 rounded bg-slate-800/80" />
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else-if="raids.length === 0"
      class="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 text-center"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 grid place-items-center">
          <svg class="w-8 h-8 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="font-medium text-slate-200">Nenhuma raid agendada</span>
        <span class="text-xs text-slate-400">
          Clique em <strong class="text-[#C6A95D]">"Criar Raid"</strong> para organizar sua primeira batalha épica!
        </span>
      </div>
    </div>

    <!-- LISTA DE RAIDS -->
    <ul v-else class="space-y-3">
      <li
        v-for="r in raids"
        :key="r.id"
        class="group relative p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-rose-500/50 transition-all duration-300 shadow-lg"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-red-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />

        <div class="relative flex items-center gap-4">
          <!-- Date Box -->
          <div
            class="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 shadow-lg"
          >
            <div class="text-2xl font-black text-rose-300">{{ formatDay(r.date) }}</div>
            <div class="text-[10px] uppercase tracking-wide text-rose-400/80">{{ formatMonth(r.date) }}</div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-100 text-base mb-1">{{ r.title }}</div>
            <div class="text-xs text-slate-400 space-x-2">
              <span>{{ formatDate(r.date) }}</span>
              <span class="text-slate-600">·</span>
              <span>{{ formatTime(r.date) }}</span>
              <span v-if="r.description" class="text-slate-600">·</span>
              <span v-if="r.description" class="text-slate-300">{{ r.description }}</span>
            </div>
          </div>

          <!-- Remove Button -->
          <button
            @click="removeRaid(r.id)"
            class="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span class="hidden sm:inline">Remover</span>
          </button>
        </div>
      </li>
    </ul>

    <!-- MODAL: Criar Raid -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div
        class="relative w-[90%] max-w-md rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 p-6 shadow-2xl animate-fade-in-up"
      >
        <!-- Glow Effect -->
        <div class="absolute -inset-1 bg-gradient-to-r from-[#C6A95D]/20 to-rose-500/20 rounded-2xl blur-xl opacity-50" />

        <div class="relative">
          <header class="mb-6 flex items-center justify-between">
            <h3 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
              Criar Nova Raid
            </h3>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-200 transition-colors"
              @click="showCreateModal = false"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </header>

          <form class="space-y-5" @submit.prevent="createRaid">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-300">Nome da Raid</label>
              <input
                v-model="newRaid.title"
                type="text"
                required
                placeholder="Ex: Fortaleza de Aço"
                class="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-300">Descrição (opcional)</label>
              <input
                v-model="newRaid.description"
                type="text"
                placeholder="Ex: Boss final do calabouço"
                class="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-300">Data e Hora</label>
              <input
                v-model="newRaid.date"
                type="datetime-local"
                required
                class="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
              />
            </div>

            <div v-if="createError" class="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ createError }}</span>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2.5 text-sm rounded-xl border-2 border-slate-600 bg-slate-800/30 text-slate-200 font-semibold hover:bg-slate-800/50 hover:border-slate-500 transition-all"
                @click="showCreateModal = false"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving || !newRaid.title || !newRaid.date"
                class="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl
                       bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold
                       shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                <span
                  v-if="saving"
                  class="h-4 w-4 rounded-full border-2 border-slate-900/60 border-t-transparent animate-spin"
                />
                <span v-else>Criar Raid</span>
              </button>
            </div>
          </form>
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

function formatMonth(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
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

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
</style>
