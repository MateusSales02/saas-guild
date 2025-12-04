<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <header class="mb-2 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p class="text-sm text-slate-400 mt-2">
          Visão geral da {{ guild?.name || 'sua guilda' }}
        </p>
      </div>

      <button
        @click="showCustomizeModal = true"
        class="px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-[#C6A95D] hover:text-[#C6A95D] transition-all flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        Personalizar
      </button>
    </header>

    <!-- ERRO -->
    <div
      v-if="err"
      class="rounded-lg border border-rose-500/70 bg-rose-950/70 px-4 py-3 text-sm text-rose-100"
    >
      ⚠️ {{ err }}
    </div>

    <!-- SEM GUILDA -->
    <div
      v-if="!loading && !guild"
      class="rounded-xl border border-amber-500/50 bg-amber-950/20 p-8 text-center"
    >
      <div class="text-6xl mb-4">🏰</div>
      <h2 class="text-2xl font-bold text-amber-400 mb-2">Nenhuma Guilda Encontrada</h2>
      <p class="text-slate-400 mb-4">
        Você ainda não faz parte de nenhuma guilda. Crie uma nova ou peça para ser convidado!
      </p>
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
        v-if="widgets.members"
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-indigo-500/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-sky-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Membros
            </p>
            <p class="mt-2 text-3xl font-black text-slate-50">{{ kpis.members }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Eventos (7 dias) -->
      <div
        v-if="widgets.events"
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-emerald-500/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Eventos (7d)
            </p>
            <p class="mt-2 text-3xl font-black text-slate-50">{{ kpis.events }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tesouraria -->
      <div
        v-if="widgets.treasury"
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-[#C6A95D]/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-[#C6A95D]/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div class="flex-1 pr-2">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tesouraria
            </p>
            <p class="mt-2 text-2xl font-black text-[#C6A95D] break-words">{{ toGold(kpis.treasury) }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#C6A95D] to-amber-500 shadow-lg shadow-[#C6A95D]/30"
          >
            <svg class="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Builds -->
      <div
        v-if="widgets.builds"
        class="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-lg hover:border-rose-500/50 transition-all duration-300"
      >
        <div class="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Builds
            </p>
            <p class="mt-2 text-3xl font-black text-slate-50">{{ kpis.builds }}</p>
          </div>
          <div
            class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- GRÁFICOS -->
    <div class="grid gap-6" :class="{'lg:grid-cols-2': widgets.eventsChart && widgets.treasuryChart}">
      <!-- Gráfico de Eventos -->
      <div
        v-if="widgets.eventsChart"
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
              Eventos
            </h2>
            <p class="text-xs text-slate-400 mt-1">Últimos {{ eventRange === '7d' ? '7' : '30' }} dias</p>
          </div>
          <select
            v-model="eventRange"
            class="text-xs px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
          </select>
        </div>

        <svg viewBox="0 0 400 160" class="w-full h-40">
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
          <path :d="eventAreaPath" fill="url(#eventGradient)" opacity="0.3" />
          <path :d="eventLinePath" fill="none" stroke="#10b981" stroke-width="3" />
          <circle
            v-for="(p, i) in eventPoints"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="5"
            fill="#10b981"
            class="cursor-pointer hover:r-7 transition-all"
          />
          <defs>
            <linearGradient id="eventGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Gráfico de Tesouraria -->
      <div
        v-if="widgets.treasuryChart"
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
              Evolução da Tesouraria
            </h2>
            <p class="text-xs text-slate-400 mt-1">Últimos {{ treasuryRange === '7d' ? '7' : '30' }} dias</p>
          </div>
          <select
            v-model="treasuryRange"
            class="text-xs px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
          </select>
        </div>

        <svg viewBox="0 0 400 160" class="w-full h-40">
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
          <path :d="treasuryAreaPath" fill="url(#treasuryGradient)" opacity="0.3" />
          <path :d="treasuryLinePath" fill="none" stroke="#C6A95D" stroke-width="3" />
          <circle
            v-for="(p, i) in treasuryPoints"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="5"
            fill="#C6A95D"
            class="cursor-pointer hover:r-7 transition-all"
          />
          <defs>
            <linearGradient id="treasuryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#C6A95D" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#C6A95D" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Próximos Eventos -->
    <div
      v-if="widgets.upcomingEvents"
      class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
    >
      <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
        Próximos Eventos
      </h2>

      <div v-if="upcoming.length === 0" class="text-sm text-slate-400 text-center py-8">
        Nenhum evento agendado
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="ev in upcoming"
          :key="ev.id"
          class="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-300"
        >
          <div
            class="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all"
          >
            <span class="text-sm font-bold text-emerald-300">
              {{ dayOfMonth(ev.date) }}
            </span>
            <span class="text-[10px] text-slate-400 uppercase">
              {{ new Date(ev.date).toLocaleDateString('pt-BR', { month: 'short' }) }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-50 truncate">{{ ev.title }}</p>
            <p class="text-xs text-slate-400">
              {{ shortTime(ev.date) }}
              <span v-if="ev.location" class="ml-2">• {{ ev.location }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- MEMBROS E BUILDS RECENTES -->
    <div class="grid gap-6" :class="{'lg:grid-cols-2': widgets.membersList && widgets.buildsList}">
      <!-- Membros Recentes -->
      <div
        v-if="widgets.membersList"
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
          Membros da Guilda
        </h2>

        <div v-if="members.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhum membro ainda
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="m in members.slice(0, 6)"
            :key="m.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-indigo-500/30 transition-all duration-300"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
            >
              {{ (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-50 truncate">
                {{ m.user?.nickname || m.user?.email || '—' }}
              </p>
              <p class="text-xs text-slate-400">{{ roleLabel(m.role) }}</p>
            </div>
          </div>
          <div v-if="members.length > 6" class="text-xs text-slate-400 text-center pt-3 border-t border-slate-800 mt-3">
            +{{ members.length - 6 }} membros
          </div>
        </div>
      </div>

      <!-- Builds Recentes -->
      <div
        v-if="widgets.buildsList"
        class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-6">
          Builds Recentes
        </h2>

        <div v-if="recentBuilds.length === 0" class="text-sm text-slate-400 text-center py-8">
          Nenhuma build criada ainda
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="build in recentBuilds"
            :key="build.id"
            class="group p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-rose-500/50 hover:bg-slate-800/60 transition-all duration-300"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-50 truncate group-hover:text-rose-300 transition-colors">
                  {{ build.name }}
                </p>
                <p class="text-xs text-slate-400 mt-1">
                  {{ build.class?.name || 'Sem classe' }}
                  <span v-if="build.spec"> • {{ build.spec.name }}</span>
                </p>
              </div>
              <span
                class="px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap border"
                :class="build.is_public ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-700/50 text-slate-300 border-slate-600'"
              >
                {{ build.is_public ? 'Pública' : 'Privada' }}
              </span>
            </div>
            <p v-if="build.member" class="mt-2 text-xs text-slate-500">
              Por: {{ build.member.user?.nickname || build.member.user?.email }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE PERSONALIZAÇÃO -->
    <div
      v-if="showCustomizeModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showCustomizeModal = false"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-slate-700">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
            Personalizar Dashboard
          </h2>
          <p class="text-sm text-slate-400 mt-1">Escolha quais widgets você quer ver</p>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div
            v-for="(value, key) in widgets"
            :key="key"
            class="flex items-center justify-between p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all"
          >
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-200">{{ getWidgetLabel(key) }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ getWidgetDescription(key) }}</p>
            </div>
            <button
              @click="widgets[key] = !widgets[key]"
              class="relative w-14 h-7 rounded-full transition-colors"
              :class="value ? 'bg-[#C6A95D]' : 'bg-slate-700'"
            >
              <div
                class="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform"
                :class="value ? 'translate-x-8' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <div class="p-6 border-t border-slate-700 flex gap-3">
          <button
            @click="resetWidgets"
            class="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 transition-all"
          >
            Resetar Padrão
          </button>
          <button
            @click="saveWidgets"
            class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-semibold hover:shadow-lg hover:shadow-[#C6A95D]/30 transition-all"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { auth } from '@/stores/auth'

import {
  MembersApi,
  EventsApi,
  FinanceApi,
  BuildsApi,
} from '@/lib/api'

type Member = { id: number; role: string; user: { id: number; email: string; nickname?: string } }
type EventItem = {
  id: number
  title: string
  date: string
  description?: string
  location?: string
  type?: string
}

const eventRange = ref<'7d' | '30d'>('7d')
const treasuryRange = ref<'7d' | '30d'>('7d')
const kpis = ref({ members: 0, online: 0, events: 0, treasury: 0, builds: 0 })
const members = ref<Member[]>([])
const events = ref<EventItem[]>([])
const guild = ref<any>(null)
const loading = ref(true)
const err = ref('')
const recentBuilds = ref<any[]>([])
const showCustomizeModal = ref(false)

const widgets = ref({
  members: true,
  events: true,
  treasury: true,
  builds: true,
  eventsChart: true,
  treasuryChart: true,
  upcomingEvents: true,
  membersList: true,
  buildsList: true,
})

onMounted(() => {
  loadWidgetPreferences()
  load()
})

function loadWidgetPreferences() {
  const saved = localStorage.getItem('dashboard_widgets')
  if (saved) {
    try {
      widgets.value = { ...widgets.value, ...JSON.parse(saved) }
    } catch (e) {
      console.error('Failed to load widget preferences', e)
    }
  }
}

function saveWidgets() {
  localStorage.setItem('dashboard_widgets', JSON.stringify(widgets.value))
  showCustomizeModal.value = false
}

function resetWidgets() {
  widgets.value = {
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
}

function getWidgetLabel(key: string): string {
  const labels: Record<string, string> = {
    members: 'Card de Membros',
    events: 'Card de Eventos',
    treasury: 'Card de Tesouraria',
    builds: 'Card de Builds',
    eventsChart: 'Gráfico de Eventos',
    treasuryChart: 'Gráfico de Tesouraria',
    upcomingEvents: 'Próximos Eventos',
    membersList: 'Lista de Membros',
    buildsList: 'Lista de Builds',
  }
  return labels[key] || key
}

function getWidgetDescription(key: string): string {
  const descriptions: Record<string, string> = {
    members: 'Total de membros da guilda',
    events: 'Eventos dos últimos 7 dias',
    treasury: 'Saldo atual da tesouraria',
    builds: 'Total de builds criadas',
    eventsChart: 'Evolução de eventos ao longo do tempo',
    treasuryChart: 'Evolução do saldo da tesouraria',
    upcomingEvents: 'Eventos agendados para o futuro',
    membersList: 'Membros recentes da guilda',
    buildsList: 'Builds criadas recentemente',
  }
  return descriptions[key] || ''
}

async function load() {
  loading.value = true
  err.value = ''

  try {
    guild.value = auth.guild

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

function toGold(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n) + 'g'
}
function dayOfMonth(iso: string) {
  return new Date(iso).getDate().toString().padStart(2, '0')
}
function shortTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function countEventsInLastDays(list: EventItem[], days: number) {
  const now = Date.now()
  const cutoff = now - days * 24 * 3600 * 1000
  return list.filter((e) => new Date(e.date).getTime() >= cutoff).length
}

function roleLabel(role: string) {
  switch (role) {
    case 'leader': return 'Líder'
    case 'officer': return 'Oficial'
    case 'líder': return 'Líder'
    default: return 'Membro'
  }
}

const upcoming = computed(() => {
  const now = Date.now()
  return [...events.value]
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 6)
})

const eventPoints = computed(() => {
  const days = eventRange.value === '7d' ? 7 : 30
  const series = buildDailySeries(events.value, days)
  const maxY = Math.max(1, ...series) * 1.2
  const stepX = 400 / (series.length - 1 || 1)
  return series.map((v, i) => ({
    x: i * stepX,
    y: 160 - (v / maxY) * 140 - 10,
  }))
})

const eventLinePath = computed(() =>
  eventPoints.value.map((p, i) => (i ? `L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`)).join(' ')
)

const eventAreaPath = computed(() => {
  if (eventPoints.value.length === 0) return 'M 0 160 L 400 160 Z'
  const start = `M 0 160 L 0 ${eventPoints.value[0].y}`
  const line = eventPoints.value.map((p) => `L ${p.x} ${p.y}`).join(' ')
  const end = 'L 400 160 Z'
  return `${start} ${line} ${end}`
})

const treasuryPoints = computed(() => {
  const days = treasuryRange.value === '7d' ? 7 : 30
  const series = Array.from({ length: days }, (_, i) => {
    const variation = Math.sin(i * 0.5) * 2000 + Math.random() * 1000
    return Math.max(0, kpis.value.treasury + variation - (days - i) * 500)
  })
  const maxY = Math.max(1, ...series) * 1.2
  const stepX = 400 / (series.length - 1 || 1)
  return series.map((v, i) => ({
    x: i * stepX,
    y: 160 - (v / maxY) * 140 - 10,
  }))
})

const treasuryLinePath = computed(() =>
  treasuryPoints.value.map((p, i) => (i ? `L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`)).join(' ')
)

const treasuryAreaPath = computed(() => {
  if (treasuryPoints.value.length === 0) return 'M 0 160 L 400 160 Z'
  const start = `M 0 160 L 0 ${treasuryPoints.value[0].y}`
  const line = treasuryPoints.value.map((p) => `L ${p.x} ${p.y}`).join(' ')
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
    if (!ev.date) continue
    const date = new Date(ev.date)
    if (isNaN(date.getTime())) continue
    const key = date.toISOString().slice(0, 10)
    if (key in buckets) buckets[key]++
  }

  return Object.values(buckets)
}
</script>
