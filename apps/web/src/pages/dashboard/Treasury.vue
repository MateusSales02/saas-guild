<template>
  <div class="page">
    <PageHeader :eyebrow="guild?.name ?? 'Guilda'" title="Tesouraria" subtitle="Entradas, saídas e o saldo da guilda em um só lugar.">
      <template #actions>
        <button type="button" class="btn btn-secondary" :disabled="list.length === 0" @click="showExportModal = true">
          <AppIcon name="download" :size="16" />
          Exportar PDF
        </button>
      </template>
    </PageHeader>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="load">Tentar novamente</button>
    </div>

    <!-- Saldo + gráfico -->
    <div class="grid gap-4 xl:grid-cols-3">
      <section class="panel relative overflow-hidden xl:col-span-2">
        <div class="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />
        <div class="relative flex flex-wrap items-start justify-between gap-4 p-6 pb-2">
          <div>
            <p class="stat-label">Saldo atual</p>
            <p class="mt-2 text-4xl font-semibold tabular-nums tracking-tight" :class="summary.balance >= 0 ? 'text-gold-100' : 'text-rose-300'">
              <span v-if="loading" class="skeleton inline-block h-10 w-56 align-middle" />
              <template v-else>{{ toGold(summary.balance) }}</template>
            </p>
            <p v-if="delta30 !== null" class="mt-2 flex items-center gap-1.5 text-sm">
              <AppIcon :name="delta30 >= 0 ? 'trend-up' : 'trend-down'" :size="16" :class="delta30 >= 0 ? 'text-emerald-300' : 'text-rose-300'" />
              <span :class="delta30 >= 0 ? 'text-emerald-300' : 'text-rose-300'">{{ delta30 >= 0 ? '+' : '' }}{{ toGold(delta30) }}</span>
              <span class="text-slate-500">nos últimos 30 dias</span>
            </p>
          </div>
        </div>
        <div class="relative px-4 pb-4">
          <div v-if="loading" class="skeleton h-[180px]" />
          <TrendChart v-else-if="history.length > 1" :points="historyPoints" :height="180" aria-label="Saldo nos últimos 30 dias" :format-value="toGold" />
          <p v-else class="py-14 text-center text-sm text-slate-500">O gráfico aparece após alguns dias de movimentação.</p>
        </div>
      </section>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <div class="stat">
          <p class="stat-label"><AppIcon name="trend-up" :size="15" class="text-emerald-400" /> Entradas</p>
          <p class="stat-value text-emerald-200">{{ toGold(summary.totalIn) }}</p>
          <p class="stat-meta">{{ countIn }} lançamentos</p>
        </div>
        <div class="stat">
          <p class="stat-label"><AppIcon name="trend-down" :size="15" class="text-rose-400" /> Saídas</p>
          <p class="stat-value text-rose-200">{{ toGold(summary.totalOut) }}</p>
          <p class="stat-meta">{{ countOut }} lançamentos</p>
        </div>
      </div>
    </div>

    <!-- Lançamento rápido -->
    <form class="panel" @submit.prevent="addTx">
      <header class="panel-header">
        <div>
          <h2 class="panel-title">Novo lançamento</h2>
          <p class="panel-subtitle">Registre taxas, vendas de loot, regear e outras movimentações</p>
        </div>
      </header>
      <div class="grid items-start gap-4 p-5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.4fr)_auto]">
        <div>
          <p class="label">Tipo</p>
          <div class="seg" role="radiogroup" aria-label="Tipo de lançamento">
            <button type="button" role="radio" class="seg-item" :aria-checked="form.type === 'in'" :aria-pressed="form.type === 'in'" @click="form.type = 'in'">
              <span class="text-emerald-300">+</span> Entrada
            </button>
            <button type="button" role="radio" class="seg-item" :aria-checked="form.type === 'out'" :aria-pressed="form.type === 'out'" @click="form.type = 'out'">
              <span class="text-rose-300">−</span> Saída
            </button>
          </div>
        </div>
        <div>
          <label for="tx-amount" class="label flex justify-between">
            Valor
            <span v-if="form.amount" class="text-slate-500">{{ toGold(Math.floor(form.amount)) }}</span>
          </label>
          <input id="tx-amount" v-model.number="form.amount" type="number" min="1" step="1000" inputmode="numeric" placeholder="0" class="input tabular-nums" />
          <div class="mt-2 flex gap-1.5">
            <button v-for="p in PRESETS" :key="p" type="button" class="chip !h-6 !px-2 !text-[11px]" @click="form.amount = (form.amount || 0) + p">
              +{{ compact(p) }}
            </button>
          </div>
        </div>
        <div>
          <label for="tx-note" class="label">Observação</label>
          <input id="tx-note" v-model="form.note" type="text" list="tx-notes" maxlength="120" placeholder="Ex: Taxa semanal, venda de loot..." class="input" />
          <datalist id="tx-notes">
            <option v-for="n in NOTE_SUGGESTIONS" :key="n" :value="n" />
          </datalist>
        </div>
        <div class="lg:pt-[22px]">
          <button type="submit" class="btn btn-primary w-full" :disabled="!guild || adding || !form.amount">
            <span v-if="adding" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
            <AppIcon v-else name="plus" :size="16" />
            Lançar
          </button>
        </div>
      </div>
    </form>

    <!-- Extrato -->
    <section class="panel overflow-hidden">
      <header class="panel-header">
        <div>
          <h2 class="panel-title">Extrato</h2>
          <p class="panel-subtitle">{{ filtered.length }} de {{ list.length }} lançamentos</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label class="relative block w-full sm:w-56">
            <span class="sr-only">Buscar lançamento</span>
            <AppIcon name="search" :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input v-model="search" type="search" placeholder="Buscar observação" class="input input-sm !pl-8" />
          </label>
          <div class="seg" role="group" aria-label="Filtrar extrato">
            <button v-for="f in FILTERS" :key="f.value" type="button" class="seg-item" :aria-pressed="typeFilter === f.value" @click="typeFilter = f.value">
              {{ f.label }}
            </button>
          </div>
        </div>
      </header>

      <div v-if="loading" class="space-y-2 p-5">
        <div v-for="i in 5" :key="i" class="skeleton h-10" />
      </div>

      <EmptyState
        v-else-if="list.length === 0"
        icon="coins"
        title="Sem lançamentos"
        text="Registre a primeira entrada ou saída no formulário acima."
      />
      <EmptyState v-else-if="filtered.length === 0" icon="search" title="Nenhum lançamento encontrado" />

      <div v-else class="overflow-x-auto">
        <table class="table min-w-[640px]">
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Descrição</th>
              <th scope="col" class="!text-right">Valor</th>
              <th scope="col"><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in paged" :key="t.id" class="group">
              <td class="whitespace-nowrap text-xs text-slate-500">
                <span class="block text-slate-300">{{ dateLabel(txDate(t)) }}</span>
                {{ timeLabel(txDate(t)) }}
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    :class="t.type === 'in' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/25 bg-rose-500/10 text-rose-300'"
                  >
                    <AppIcon :name="t.type === 'in' ? 'trend-up' : 'trend-down'" :size="15" />
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-slate-100">{{ t.note || (t.type === 'in' ? 'Entrada' : 'Saída') }}</p>
                    <p v-if="t.user?.nickname" class="text-xs text-slate-500">por {{ t.user.nickname }}</p>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap text-right font-semibold tabular-nums" :class="t.type === 'in' ? 'text-emerald-300' : 'text-rose-300'">
                {{ t.type === 'in' ? '+' : '−' }}{{ toGold(Number(t.amount)) }}
              </td>
              <td class="w-12 text-right">
                <button
                  type="button"
                  class="btn btn-ghost btn-icon btn-sm opacity-0 hover:!text-rose-300 focus:opacity-100 group-hover:opacity-100"
                  :aria-label="`Excluir lançamento ${t.note || ''}`"
                  @click="removeTx(t)"
                >
                  <AppIcon name="trash" :size="15" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="filtered.length > paged.length" class="panel-footer justify-center">
        <button type="button" class="btn btn-ghost btn-sm" @click="pageSize += 25">Mostrar mais {{ Math.min(25, filtered.length - paged.length) }}</button>
      </footer>
    </section>

    <!-- EXPORTAR -->
    <Teleport to="body">
      <div v-if="showExportModal" class="modal-backdrop" @mousedown.self="showExportModal = false" @keydown.esc="showExportModal = false">
        <div class="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="export-title">
          <header class="panel-header">
            <div>
              <h2 id="export-title" class="section-title">Exportar relatório</h2>
              <p class="panel-subtitle">PDF com resumo e lançamentos do período</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="showExportModal = false">
              <AppIcon name="x" />
            </button>
          </header>
          <div class="space-y-4 p-5">
            <div class="flex flex-wrap gap-2">
              <button v-for="p in PERIODS" :key="p.value" type="button" class="chip" :aria-pressed="exportFilter.period === p.value" @click="setPeriod(p.value)">
                {{ p.label }}
              </button>
            </div>
            <div v-if="exportFilter.period === 'custom'" class="grid grid-cols-2 gap-3">
              <div>
                <label for="exp-start" class="label">De</label>
                <input id="exp-start" v-model="exportFilter.startDate" type="date" class="input" />
              </div>
              <div>
                <label for="exp-end" class="label">Até</label>
                <input id="exp-end" v-model="exportFilter.endDate" type="date" class="input" />
              </div>
            </div>
            <p class="inset px-3 py-2 text-xs text-slate-400">
              {{ filteredTransactions.length }} lançamentos no período
            </p>
          </div>
          <footer class="flex justify-end gap-2 border-t border-white/[0.06] p-4">
            <button type="button" class="btn btn-ghost" @click="showExportModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary" :disabled="generatingPDF || filteredTransactions.length === 0" @click="generatePDF">
              <span v-if="generatingPDF" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
              <AppIcon v-else name="download" :size="16" />
              {{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import TrendChart from '@/components/ui/TrendChart.vue'
import { FinanceApi } from '@/lib/api'
import { friendlyError } from '@/lib/errors'
import { normalizeText } from '@/lib/market'
import { confirmAction, toast } from '@/lib/toast'
import { auth } from '@/stores/auth'

type Tx = {
  id: number
  type: 'in' | 'out'
  amount: number
  note?: string
  created_at?: string
  createdAt?: string
  user?: { nickname?: string }
}
type Period = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'

const PRESETS = [100_000, 1_000_000, 10_000_000]
const NOTE_SUGGESTIONS = ['Taxa de guilda', 'Venda de loot', 'Doação', 'Regear', 'Reparo de equipamentos', 'Compra de montarias', 'Pagamento de hideout']
const FILTERS: Array<{ value: 'all' | 'in' | 'out'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Saídas' },
]
const PERIODS: Array<{ value: Period; label: string }> = [
  { value: 'all', label: 'Tudo' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
]

const guild = computed(() => auth.guild)
const list = ref<Tx[]>([])
const history = ref<Array<{ date: string; balance: number }>>([])
const summary = ref({ totalIn: 0, totalOut: 0, balance: 0 })
const loading = ref(true)
const adding = ref(false)
const error = ref('')
const search = ref('')
const typeFilter = ref<'all' | 'in' | 'out'>('all')
const pageSize = ref(25)
const showExportModal = ref(false)
const generatingPDF = ref(false)
const form = ref<{ type: 'in' | 'out'; amount: number | null; note: string }>({ type: 'in', amount: null, note: '' })
const exportFilter = ref<{ period: Period; startDate: string; endDate: string }>({ period: 'all', startDate: '', endDate: '' })

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (!guild.value) {
      list.value = []
      summary.value = { totalIn: 0, totalOut: 0, balance: 0 }
      return
    }
    const [items, s, h] = await Promise.all([
      FinanceApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
      FinanceApi.dailyHistory(guild.value.id, 30).catch(() => []),
    ])
    list.value = items ?? []
    summary.value = { totalIn: s?.totalIn ?? 0, totalOut: s?.totalOut ?? 0, balance: s?.balance ?? 0 }
    history.value = h ?? []
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar a tesouraria.')
  } finally {
    loading.value = false
  }
}

// ---------- Derivados ----------
const countIn = computed(() => list.value.filter((t) => t.type === 'in').length)
const countOut = computed(() => list.value.filter((t) => t.type === 'out').length)

const historyPoints = computed(() =>
  history.value.map((d) => {
    const date = new Date(`${d.date.slice(0, 10)}T12:00:00`)
    return {
      value: d.balance,
      label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
      short: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }
  }),
)

const delta30 = computed(() => {
  const h = history.value
  return h.length >= 2 ? h[h.length - 1].balance - h[0].balance : null
})

const filtered = computed(() => {
  const needle = normalizeText(search.value)
  return [...list.value]
    .filter((t) => typeFilter.value === 'all' || t.type === typeFilter.value)
    .filter((t) => !needle || normalizeText(t.note ?? '').includes(needle))
    .sort((a, b) => +txDate(b) - +txDate(a))
})
const paged = computed(() => filtered.value.slice(0, pageSize.value))
watch([search, typeFilter], () => (pageSize.value = 25))

// ---------- Ações ----------
function recomputeSummary() {
  const totalIn = list.value.filter((i) => i.type === 'in').reduce((a, b) => a + Number(b.amount || 0), 0)
  const totalOut = list.value.filter((i) => i.type === 'out').reduce((a, b) => a + Number(b.amount || 0), 0)
  summary.value = { totalIn, totalOut, balance: totalIn - totalOut }
}

async function addTx() {
  if (!guild.value || !form.value.amount) return
  adding.value = true
  const payload = {
    guildId: guild.value.id,
    type: form.value.type,
    amount: Math.max(1, Math.floor(form.value.amount)),
    note: form.value.note.trim() || undefined,
  }
  // Atualização otimista: aparece na hora e desfaz se a API falhar
  const tempId = -Date.now()
  list.value = [{ id: tempId, ...payload, created_at: new Date().toISOString() }, ...list.value]
  recomputeSummary()
  try {
    const created = await FinanceApi.create(payload)
    list.value = list.value.map((i) => (i.id === tempId ? created : i))
    toast(payload.type === 'in' ? 'Entrada registrada' : 'Saída registrada', { text: `${toGold(payload.amount)}${payload.note ? ` · ${payload.note}` : ''}` })
    form.value = { type: form.value.type, amount: null, note: '' }
  } catch (e) {
    list.value = list.value.filter((i) => i.id !== tempId)
    recomputeSummary()
    toast('Não foi possível lançar', { tone: 'error', text: friendlyError(e) })
  } finally {
    adding.value = false
  }
}

async function removeTx(tx: Tx) {
  const ok = await confirmAction({
    title: 'Excluir lançamento?',
    text: `${tx.type === 'in' ? 'Entrada' : 'Saída'} de ${toGold(Number(tx.amount))}${tx.note ? ` (${tx.note})` : ''}. O saldo será recalculado.`,
    confirmLabel: 'Excluir',
    danger: true,
  })
  if (!ok) return
  const prev = [...list.value]
  list.value = list.value.filter((i) => i.id !== tx.id)
  recomputeSummary()
  try {
    await FinanceApi.remove(tx.id)
    toast('Lançamento excluído')
  } catch (e) {
    list.value = prev
    recomputeSummary()
    toast('Não foi possível excluir', { tone: 'error', text: friendlyError(e) })
  }
}

// ---------- Formatação ----------
function toGold(n: number) {
  return `${new Intl.NumberFormat('pt-BR').format(n)}g`
}

function compact(n: number) {
  return n >= 1_000_000 ? `${n / 1_000_000}M` : `${n / 1_000}k`
}

function txDate(t: Tx): Date {
  return new Date(t.created_at ?? t.createdAt ?? 0)
}

function dateLabel(d: Date) {
  const today = new Date()
  const yesterday = new Date(Date.now() - 86_400_000)
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' })
}

function timeLabel(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ---------- Exportação ----------
function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function setPeriod(period: Period) {
  const now = new Date()
  const today = isoDay(now)
  const ranges: Record<Period, [string, string]> = {
    all: ['', ''],
    today: [today, today],
    week: [isoDay(new Date(now.getTime() - 6 * 86_400_000)), today],
    month: [isoDay(new Date(now.getFullYear(), now.getMonth(), 1)), today],
    year: [isoDay(new Date(now.getFullYear(), 0, 1)), today],
    custom: [exportFilter.value.startDate, exportFilter.value.endDate],
  }
  exportFilter.value = { period, startDate: ranges[period][0], endDate: ranges[period][1] }
}

const filteredTransactions = computed(() => {
  if (exportFilter.value.period === 'all') return list.value
  const start = exportFilter.value.startDate ? new Date(`${exportFilter.value.startDate}T00:00:00`) : null
  const end = exportFilter.value.endDate ? new Date(`${exportFilter.value.endDate}T23:59:59`) : null
  return list.value.filter((t) => {
    const d = txDate(t)
    return (!start || d >= start) && (!end || d <= end)
  })
})

async function generatePDF() {
  generatingPDF.value = true
  try {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let y = margin

    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', margin, y)
    y += 9
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Guilda: ${guild.value?.name || 'N/A'}`, margin, y)
    y += 6
    const { period, startDate, endDate } = exportFilter.value
    const periodText =
      period === 'all' || !startDate || !endDate
        ? 'Período: todos os lançamentos'
        : `Período: ${new Date(`${startDate}T12:00:00`).toLocaleDateString('pt-BR')} a ${new Date(`${endDate}T12:00:00`).toLocaleDateString('pt-BR')}`
    doc.text(periodText, margin, y)
    y += 10

    const txs = filteredTransactions.value
    const totalIn = txs.filter((t) => t.type === 'in').reduce((a, b) => a + Number(b.amount || 0), 0)
    const totalOut = txs.filter((t) => t.type === 'out').reduce((a, b) => a + Number(b.amount || 0), 0)
    const boxes: Array<[string, number, [number, number, number]]> = [
      ['Entradas', totalIn, [0, 110, 60]],
      ['Saídas', totalOut, [150, 30, 30]],
      ['Saldo do período', totalIn - totalOut, [120, 95, 30]],
    ]
    boxes.forEach(([label, value, color], i) => {
      const x = margin + i * 60
      doc.setDrawColor(220, 220, 220)
      doc.rect(x, y, 56, 18)
      doc.setFontSize(9)
      doc.setTextColor(110, 110, 110)
      doc.text(label, x + 3, y + 6)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...color)
      doc.text(toGold(value), x + 3, y + 13)
      doc.setFont('helvetica', 'normal')
    })
    y += 28

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    ;['Data', 'Tipo', 'Valor', 'Observação'].forEach((h, i) => doc.text(h, margin + [0, 32, 55, 92][i], y))
    y += 3
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    for (const tx of [...txs].sort((a, b) => +txDate(b) - +txDate(a))) {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = margin
      }
      doc.setTextColor(60, 60, 60)
      doc.text(txDate(tx).toLocaleDateString('pt-BR'), margin, y)
      doc.text(tx.type === 'in' ? 'Entrada' : 'Saída', margin + 32, y)
      if (tx.type === 'in') doc.setTextColor(0, 110, 60)
      else doc.setTextColor(150, 30, 30)
      doc.text(`${tx.type === 'in' ? '+' : '-'}${toGold(Number(tx.amount))}`, margin + 55, y)
      doc.setTextColor(100, 100, 100)
      doc.text((tx.note || '—').substring(0, 50), margin + 92, y)
      y += 6
    }

    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10)
    doc.text('Guild Mesh', pageWidth - margin - 18, pageHeight - 10)
    doc.save(`relatorio-financeiro-${guild.value?.name || 'guilda'}-${isoDay(new Date())}.pdf`)

    showExportModal.value = false
    toast('Relatório gerado')
  } catch (e) {
    toast('Não foi possível gerar o PDF', { tone: 'error', text: friendlyError(e) })
  } finally {
    generatingPDF.value = false
  }
}
</script>
