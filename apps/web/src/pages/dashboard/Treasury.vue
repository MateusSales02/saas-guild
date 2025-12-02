<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
  >
    <!-- HEADER -->
    <header class="flex flex-col gap-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
              </svg>
            </div>
            Tesouraria
          </h2>
          <p class="mt-2 text-sm text-slate-400">
            Gerencie as finanças da sua guilda
          </p>
        </div>

        <!-- Export PDF Button -->
        <button
          @click="showExportModal = true"
          :disabled="list.length === 0"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/>
          </svg>
          Exportar PDF
        </button>
      </div>

      <!-- FORM DE ENTRADA/SAÍDA -->
      <div class="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div class="flex flex-col gap-2 flex-1 min-w-[120px]">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tipo</label>
          <select
            v-model="form.type"
            class="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 text-sm focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          >
            <option value="in">Entrada</option>
            <option value="out">Saída</option>
          </select>
        </div>
        <div class="flex flex-col gap-2 flex-1 min-w-[120px]">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Valor</label>
          <input
            v-model.number="form.amount"
            type="number"
            min="1"
            placeholder="1000"
            class="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          />
        </div>
        <div class="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Observação</label>
          <input
            v-model="form.note"
            type="text"
            placeholder="Opcional..."
            class="px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          />
        </div>
        <button
          @click="addTx"
          :disabled="!guild || adding || !form.amount"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                 bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-sm
                 shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
        >
          <svg v-if="!adding" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
          </svg>
          <span
            v-if="adding"
            class="h-4 w-4 rounded-full border-2 border-slate-900/60 border-t-transparent animate-spin"
          />
          {{ adding ? 'Adicionando...' : 'Adicionar' }}
        </button>
      </div>
    </header>

    <!-- ERROR -->
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

    <!-- SUMMARY CARDS -->
    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      <div class="group relative p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-emerald-500/50 transition-all duration-300 shadow-lg">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Entradas</span>
            <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="text-2xl font-black text-emerald-300">{{ toGold(summary.totalIn) }}</div>
        </div>
      </div>

      <div class="group relative p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-red-500/50 transition-all duration-300 shadow-lg">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Saídas</span>
            <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="text-2xl font-black text-red-300">{{ toGold(summary.totalOut) }}</div>
        </div>
      </div>

      <div class="group relative p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-[#C6A95D]/50 transition-all duration-300 shadow-lg">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-[#C6A95D]/10 to-amber-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div class="relative">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Saldo</span>
            <svg class="w-5 h-5 text-[#C6A95D]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div
            class="text-2xl font-black"
            :class="summary.balance >= 0 ? 'text-[#C6A95D]' : 'text-red-400'"
          >
            {{ toGold(summary.balance) }}
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-sm text-slate-400 py-8 text-center">
      Carregando lançamentos...
    </div>

    <!-- TABLE -->
    <div v-else class="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30 shadow-lg">
      <table class="w-full text-xs sm:text-sm">
        <thead class="bg-slate-800/60 border-b border-slate-700/50">
          <tr class="text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
            <th class="px-4 py-3.5">Tipo</th>
            <th class="px-4 py-3.5">Valor</th>
            <th class="px-4 py-3.5">Observação</th>
            <th class="px-4 py-3.5">Data</th>
            <th class="px-4 py-3.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in list"
            :key="t.id"
            class="border-t border-slate-700/30 hover:bg-slate-800/50 transition-all duration-200"
          >
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold border"
                :class="[
                  t.type === 'in'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40',
                ]"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="t.type === 'in'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/>
                  <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"/>
                </svg>
                {{ t.type === 'in' ? 'Entrada' : 'Saída' }}
              </span>
            </td>
            <td class="px-4 py-3 font-bold text-slate-100">{{ toGold(t.amount) }}</td>
            <td class="px-4 py-3 text-slate-300">{{ t.note || '—' }}</td>
            <td class="px-4 py-3 text-slate-400 text-xs">{{ new Date(t.created_at).toLocaleString('pt-BR') }}</td>
            <td class="px-4 py-3 text-right">
              <button
                @click="removeTx(t.id)"
                class="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition-all duration-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span class="hidden sm:inline">Remover</span>
              </button>
            </td>
          </tr>
          <tr v-if="list.length === 0">
            <td class="px-4 py-8 text-center text-slate-400 text-xs sm:text-sm" colspan="5">
              <div class="flex flex-col items-center gap-3">
                <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 grid place-items-center">
                  <svg class="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="font-medium text-slate-200">Sem lançamentos</span>
                <span class="text-xs text-slate-400">
                  Use o formulário acima para adicionar entradas e saídas
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- EXPORT MODAL -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
      @click.self="showExportModal = false"
    >
      <div class="relative w-full max-w-md mx-4 p-6 rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 shadow-2xl">
        <button
          @click="showExportModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>

        <h3 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent mb-4">
          Exportar Relatório PDF
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-300 mb-2">Período</label>
            <select
              v-model="exportFilter.period"
              @change="onPeriodChange"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
            >
              <option value="all">Todos os lançamentos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div v-if="exportFilter.period === 'custom'" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-2">Data Inicial</label>
              <input
                v-model="exportFilter.startDate"
                type="date"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-2">Data Final</label>
              <input
                v-model="exportFilter.endDate"
                type="date"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="showExportModal = false"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800/50 text-slate-200 font-semibold hover:bg-slate-700/50 hover:border-slate-500 transition-all"
            >
              Cancelar
            </button>
            <button
              @click="generatePDF"
              :disabled="generatingPDF"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
            >
              <span
                v-if="generatingPDF"
                class="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin"
              />
              {{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { auth } from '@/stores/auth'
import { FinanceApi } from '@/lib/api'
import jsPDF from 'jspdf'

const guild = ref<any>(null)
const list = ref<any[]>([])
const summary = ref<{ totalIn: number; totalOut: number; balance: number }>({
  totalIn: 0,
  totalOut: 0,
  balance: 0,
})
const loading = ref(true)
const adding = ref(false)
const error = ref('')
const showExportModal = ref(false)
const generatingPDF = ref(false)

const form = ref<{ type: 'in' | 'out'; amount: number | null; note: string }>({
  type: 'in',
  amount: null,
  note: '',
})

const exportFilter = ref({
  period: 'all',
  startDate: '',
  endDate: '',
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    // Usa a guilda do usuário autenticado
    guild.value = auth.guild
    if (!guild.value) {
      list.value = []
      summary.value = { totalIn: 0, totalOut: 0, balance: 0 }
      return
    }
    const [items, s] = await Promise.all([
      FinanceApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
    ])
    list.value = items
    summary.value = s
  } catch (e: any) {
    error.value = e.message || 'Falha ao carregar tesouraria'
  } finally {
    loading.value = false
  }
}

const recomputeSummary = () => {
  const totalIn = list.value
    .filter((i) => i.type === 'in')
    .reduce((a, b) => a + Number(b.amount || 0), 0)
  const totalOut = list.value
    .filter((i) => i.type === 'out')
    .reduce((a, b) => a + Number(b.amount || 0), 0)
  summary.value = { totalIn, totalOut, balance: totalIn - totalOut }
}

const addTx = async () => {
  if (!guild.value || !form.value.amount) return
  adding.value = true
  error.value = ''

  const payload = {
    guildId: guild.value.id,
    type: form.value.type,
    amount: Math.max(1, Math.floor(form.value.amount)),
    note: form.value.note?.trim() || undefined,
  }

  // atualização otimista
  const tempId = -Date.now()
  list.value = [{ id: tempId, ...payload, created_at: new Date().toISOString() }, ...list.value]
  recomputeSummary()

  try {
    const created = await FinanceApi.create(payload)
    list.value = list.value.map((i) => (i.id === tempId ? created : i))
    form.value = { type: 'in', amount: null, note: '' }
  } catch (e: any) {
    list.value = list.value.filter((i) => i.id !== tempId)
    recomputeSummary()
    error.value = e.message || 'Falha ao adicionar lançamento'
  } finally {
    adding.value = false
  }
}

const removeTx = async (id: number) => {
  const prev = [...list.value]
  list.value = list.value.filter((i) => i.id !== id)
  recomputeSummary()
  try {
    await FinanceApi.remove(id)
  } catch (e: any) {
    list.value = prev
    recomputeSummary()
    error.value = e.message || 'Falha ao remover'
  }
}

const toGold = (n: number) => new Intl.NumberFormat('pt-BR').format(n) + 'g'

function onPeriodChange() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  switch (exportFilter.value.period) {
    case 'today':
      exportFilter.value.startDate = today
      exportFilter.value.endDate = today
      break
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      exportFilter.value.startDate = weekAgo.toISOString().split('T')[0]
      exportFilter.value.endDate = today
      break
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
      exportFilter.value.startDate = monthAgo.toISOString().split('T')[0]
      exportFilter.value.endDate = today
      break
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      exportFilter.value.startDate = yearStart.toISOString().split('T')[0]
      exportFilter.value.endDate = today
      break
    case 'custom':
      exportFilter.value.startDate = ''
      exportFilter.value.endDate = ''
      break
    default:
      exportFilter.value.startDate = ''
      exportFilter.value.endDate = ''
  }
}

const filteredTransactions = computed(() => {
  if (exportFilter.value.period === 'all') return list.value

  return list.value.filter((t) => {
    const txDate = new Date(t.created_at)
    const start = exportFilter.value.startDate ? new Date(exportFilter.value.startDate) : null
    const end = exportFilter.value.endDate ? new Date(exportFilter.value.endDate + 'T23:59:59') : null

    if (start && txDate < start) return false
    if (end && txDate > end) return false
    return true
  })
})

function generatePDF() {
  generatingPDF.value = true

  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let y = margin

    // Título
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', margin, y)
    y += 10

    // Subtítulo com nome da guilda e período
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Guilda: ${guild.value?.name || 'N/A'}`, margin, y)
    y += 6

    let periodText = 'Período: Todos os lançamentos'
    if (exportFilter.value.period !== 'all') {
      if (exportFilter.value.startDate && exportFilter.value.endDate) {
        periodText = `Período: ${new Date(exportFilter.value.startDate).toLocaleDateString('pt-BR')} - ${new Date(exportFilter.value.endDate).toLocaleDateString('pt-BR')}`
      }
    }
    doc.text(periodText, margin, y)
    y += 6

    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin, y)
    y += 10

    // Calcular resumo do período filtrado
    const totalIn = filteredTransactions.value
      .filter((t) => t.type === 'in')
      .reduce((a, b) => a + Number(b.amount || 0), 0)
    const totalOut = filteredTransactions.value
      .filter((t) => t.type === 'out')
      .reduce((a, b) => a + Number(b.amount || 0), 0)
    const balance = totalIn - totalOut

    // Resumo em caixas
    doc.setFillColor(220, 252, 231) // Verde claro
    doc.rect(margin, y, 55, 20, 'F')
    doc.setFontSize(10)
    doc.setTextColor(0, 100, 0)
    doc.text('Entradas', margin + 2, y + 5)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(toGold(totalIn), margin + 2, y + 13)

    doc.setFillColor(254, 226, 226) // Vermelho claro
    doc.rect(margin + 60, y, 55, 20, 'F')
    doc.setTextColor(139, 0, 0)
    doc.text('Saídas', margin + 62, y + 5)
    doc.text(toGold(totalOut), margin + 62, y + 13)

    doc.setFillColor(255, 251, 235) // Amarelo claro
    doc.rect(margin + 120, y, 55, 20, 'F')
    doc.setTextColor(balance >= 0 ? 100 : 139, balance >= 0 ? 100 : 0, 0)
    doc.text('Saldo', margin + 122, y + 5)
    doc.text(toGold(balance), margin + 122, y + 13)

    y += 28

    // Resetar cor do texto
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    // Tabela de lançamentos
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Lançamentos', margin, y)
    y += 8

    // Cabeçalho da tabela
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Data', margin, y)
    doc.text('Tipo', margin + 35, y)
    doc.text('Valor', margin + 60, y)
    doc.text('Observação', margin + 90, y)
    y += 4
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5

    // Itens da tabela
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    const sortedTransactions = [...filteredTransactions.value].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    for (const tx of sortedTransactions) {
      // Check if we need a new page
      if (y > pageHeight - 20) {
        doc.addPage()
        y = margin
      }

      const date = new Date(tx.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
      const type = tx.type === 'in' ? 'Entrada' : 'Saída'
      const amount = toGold(tx.amount)
      const note = tx.note || '—'

      doc.setTextColor(tx.type === 'in' ? 0 : 139, tx.type === 'in' ? 100 : 0, 0)
      doc.text(date, margin, y)
      doc.text(type, margin + 35, y)
      doc.text(amount, margin + 60, y)
      doc.setTextColor(100, 100, 100)
      doc.text(note.substring(0, 35), margin + 90, y)

      doc.setTextColor(0, 0, 0)
      y += 6
    }

    // Rodapé
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10)
    doc.text('Powered by SaaS Guild', pageWidth - margin - 35, pageHeight - 10)

    // Salvar PDF
    const filename = `relatorio-financeiro-${guild.value?.name || 'guild'}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)

    showExportModal.value = false
  } catch (e: any) {
    error.value = 'Falha ao gerar PDF: ' + (e.message || 'Erro desconhecido')
  } finally {
    generatingPDF.value = false
  }
}
</script>
