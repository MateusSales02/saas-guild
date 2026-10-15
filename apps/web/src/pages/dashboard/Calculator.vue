<template>
  <div class="page">
    <PageHeader
      eyebrow="Ferramentas"
      title="Calculadora de craft"
      subtitle="Encontre os crafts e refinos mais lucrativos e simule o investimento."
    >
      <template #actions>
        <div class="seg" role="group" aria-label="Servidor">
          <button
            v-for="r in REGIONS"
            :key="r.value"
            type="button"
            class="seg-item"
            :aria-pressed="region === r.value"
            @click="region = r.value"
          >
            {{ r.label }}
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- FILTROS -->
    <form class="panel p-4 sm:p-5" @submit.prevent="scan">
      <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-12 gap-3 items-end">
        <label class="col-span-2 xl:col-span-3 block">
          <span class="label">Categoria</span>
          <select v-model="settings.category" class="select">
            <optgroup v-for="g in categoryGroups" :key="g.group" :label="g.group">
              <option v-for="c in g.items" :key="c.value" :value="c.value">{{ c.label }}</option>
            </optgroup>
          </select>
        </label>

        <label class="block xl:col-span-1">
          <span class="label">Tier</span>
          <select v-model.number="settings.tier" class="select">
            <option :value="0">Todos</option>
            <option v-for="t in [2, 3, 4, 5, 6, 7, 8]" :key="t" :value="t">T{{ t }}</option>
          </select>
        </label>

        <label class="block xl:col-span-1">
          <span class="label">Encant.</span>
          <select v-model.number="settings.enchant" class="select">
            <option :value="-1">Todos</option>
            <option v-for="e in [0, 1, 2, 3, 4]" :key="e" :value="e">.{{ e }}</option>
          </select>
        </label>

        <!-- Cidades -->
        <div ref="citiesRef" class="relative col-span-2 sm:col-span-1 xl:col-span-2">
          <span class="label" id="cities-label">Cidades</span>
          <button
            type="button"
            class="input flex items-center justify-between gap-2 text-left"
            aria-labelledby="cities-label"
            :aria-expanded="citiesOpen"
            @click="citiesOpen = !citiesOpen"
          >
            <span>{{ settings.cities.length }} de {{ MARKET_CITIES.length }}</span>
            <svg class="w-4 h-4 text-slate-400 transition-transform" :class="{ 'rotate-180': citiesOpen }" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div
            v-if="citiesOpen"
            class="absolute left-0 z-30 mt-2 w-60 rounded-xl border border-white/10 bg-ink-850 p-2 shadow-pop"
          >
            <label
              v-for="city in MARKET_CITIES"
              :key="city"
              class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-200 hover:bg-slate-800/70"
            >
              <input v-model="settings.cities" type="checkbox" :value="city" />
              <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: CITY_COLORS[city] }" />
              {{ city }}
              <span v-if="city === 'Black Market'" class="ml-auto text-[10px] text-slate-500">só venda</span>
            </label>
            <div class="mt-1 flex justify-between border-t border-slate-800 px-2 pt-2 text-[11px]">
              <button type="button" class="text-slate-400 hover:text-gold-300" @click="settings.cities = [...MARKET_CITIES]">Todas</button>
              <button type="button" class="text-slate-400 hover:text-gold-300" @click="settings.cities = [...ROYAL_CITIES]">Só cidades reais</button>
            </div>
          </div>
        </div>

        <label class="block xl:col-span-1">
          <span class="label" title="Taxa de retorno de recursos. Vazio = automático (bônus da cidade de refino)">Retorno %</span>
          <input
            v-model="returnInput"
            type="number"
            min="0"
            max="90"
            step="0.1"
            placeholder="Auto"
            class="input text-right tabular-nums"
          />
        </label>

        <label class="block xl:col-span-1">
          <span class="label" title="Tarifa da estação de produção (prata por 100 de nutrição)">Estação</span>
          <input v-model.number="settings.stationFee" type="number" min="0" step="50" class="input text-right tabular-nums" />
        </label>

        <div class="col-span-2 sm:col-span-2 xl:col-span-3 flex flex-wrap items-center gap-x-4 gap-y-2 pb-2">
          <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 cursor-pointer">
            <input v-model="settings.premium" type="checkbox" /> Premium
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 cursor-pointer" title="+59% de bônus de produção">
            <input v-model="settings.focus" type="checkbox" /> Usar foco
          </label>
          <button type="button" class="text-[11px] text-slate-500 hover:text-slate-300" @click="resetSettings">Restaurar padrão</button>
        </div>
      </div>

      <div class="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          :disabled="scanning || settings.cities.length === 0"
          class="btn btn-primary"
        >
          <span v-if="scanning" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
          <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          {{ scanning ? `Buscando${progress.total > 1 ? ` (${progress.done}/${progress.total})` : '...'}` : 'Buscar oportunidades' }}
        </button>
        <p class="text-xs text-slate-500">
          <template v-if="settings.cities.length === 0">Selecione ao menos uma cidade.</template>
          <template v-else-if="scanIsOutdated">Filtros alterados: clique em buscar para atualizar a lista.</template>
          <template v-else>Retorno {{ returnInput === '' ? 'automático' : `${returnInput}%` }} · preços de qualidade Normal com até {{ MAX_AGE_HOURS }}h</template>
        </p>
      </div>
    </form>

    <p v-if="error" role="alert" class="alert alert-error items-center justify-between">
      {{ error }}
      <button type="button" class="btn btn-danger btn-sm shrink-0" @click="scan">
        Tentar novamente
      </button>
    </p>

    <!-- RESULTADOS -->
    <div class="panel overflow-hidden">
      <!-- Barra de filtros da lista -->
      <div v-if="opportunities.length" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/50">
        <label class="relative block sm:w-72">
          <span class="sr-only">Filtrar resultados</span>
          <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <input v-model="filterText" type="text" placeholder="Filtrar por nome..." class="input !pl-9" />
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <label class="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input v-model="onlyProfitable" type="checkbox" /> Só lucrativos
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs text-slate-400 md:hidden">
            Ordenar
            <select v-model="sortKey" class="select input-sm">
              <option v-for="c in SORT_OPTIONS" :key="c.key" :value="c.key">{{ c.label }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Carregando -->
      <div v-if="scanning && !opportunities.length" class="p-4 space-y-2" aria-busy="true">
        <div v-for="n in 6" :key="n" class="h-16 rounded-lg bg-slate-800/50 animate-pulse" />
      </div>

      <!-- Estado inicial -->
      <div v-else-if="!hasScanned" class="py-16 px-4 text-center">
        <svg class="mx-auto w-10 h-10 text-[#C6A95D]/70" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <h3 class="mt-3 text-lg font-bold text-slate-200">Pronto para pesquisar</h3>
        <p class="mt-1 text-sm text-slate-400">Ajuste os filtros e a configuração, depois clique em <strong class="text-gold-300">Buscar oportunidades</strong>.</p>
      </div>

      <!-- Sem resultado -->
      <div v-else-if="!visibleRows.length && !scanning" class="py-14 px-4 text-center text-slate-400">
        <div class="text-4xl mb-2" aria-hidden="true">📭</div>
        <h3 class="text-base font-bold text-slate-300">Nenhuma oportunidade encontrada</h3>
        <p class="mt-1 text-sm">
          {{ opportunities.length
            ? 'Nenhum item corresponde ao filtro. Desmarque "Só lucrativos" ou limpe o texto.'
            : 'Não há preços recentes suficientes nas cidades escolhidas. Tente incluir mais cidades ou outro tier.' }}
        </p>
      </div>

      <template v-else>
        <!-- Tabela (desktop) -->
        <div class="hidden md:block overflow-x-auto" :class="{ 'opacity-60': scanning }">
          <table class="w-full min-w-[820px] text-sm">
            <thead class="bg-ink-850">
              <tr>
                <th
                  v-for="col in COLUMNS"
                  :key="col.key"
                  scope="col"
                  class="p-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  :class="col.align === 'left' ? 'text-left' : 'text-right'"
                  :aria-sort="col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
                >
                  <button
                    v-if="col.sortable"
                    type="button"
                    class="w-full px-3 py-3 uppercase whitespace-nowrap hover:text-gold-300 transition-colors"
                    :class="[col.align === 'left' ? 'text-left' : 'text-right', sortKey === col.key ? 'text-gold-300' : '']"
                    @click="setSort(col.key as SortKey)"
                  >
                    {{ col.label }}
                    <span class="inline-block w-2">{{ sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
                  </button>
                  <span v-else class="block px-3 py-3">{{ col.label }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <tr
                v-for="row in pagedRows"
                :key="row.productId"
                class="hover:bg-slate-700/20 transition-colors cursor-pointer"
                @click="openCalculator(row.productId)"
              >
                <td class="px-3 py-3">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <ItemIcon :item-id="row.productId" :size="44" />
                      <span class="absolute -left-1 -top-1 rounded bg-slate-800 border border-slate-600 px-1 text-[9px] font-bold text-slate-200">T{{ tierOf(row.productId) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-slate-100 max-w-[190px]">
                        {{ craftItemName(row.productId, book!) }}
                        <span :class="ENCHANT_TEXT[enchantOf(row.productId)]">.{{ enchantOf(row.productId) }}</span>
                      </p>
                      <p class="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span class="rounded border border-slate-600/60 px-1 text-[9px] font-bold uppercase text-slate-400">{{ isRefining(row.productId) ? 'Refino' : 'Craft' }}</span>
                        <span class="font-mono">{{ row.productId }}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-3 text-right">
                  <p class="tabular-nums font-bold text-rose-300">-{{ formatShort(row.costPerUnit) }}</p>
                  <p class="whitespace-nowrap text-[11px] text-slate-500">Comprar: {{ row.buyCity ?? 'várias cidades' }}</p>
                  <p class="whitespace-nowrap text-[11px] text-slate-500">{{ formatShort(row.costPerCraft) }} por craft · -{{ pctShort(row.returnRate) }}</p>
                </td>
                <td class="px-3 py-3 text-right">
                  <p class="tabular-nums font-bold text-emerald-300">+{{ formatShort(row.sellNet) }}</p>
                  <p class="whitespace-nowrap text-[11px] text-slate-500">{{ row.sellCity }}{{ row.sellMode === 'instant' ? ' · imediata' : '' }}</p>
                  <p class="whitespace-nowrap text-[11px] text-slate-500">bruto {{ formatShort(row.sellGross) }} · -{{ formatShort(row.sellGross - row.sellNet) }}</p>
                </td>
                <td class="px-3 py-3 text-right tabular-nums text-base font-bold" :class="row.profit >= 0 ? 'text-slate-50' : 'text-rose-300'">
                  {{ formatShort(row.profit) }}
                </td>
                <td class="px-3 py-3 text-right">
                  <MarginBadge :margin="row.margin" />
                </td>
                <td class="px-3 py-3 text-right">
                  <p class="tabular-nums font-semibold text-slate-200">{{ pctShort(row.returnRate) }}</p>
                  <p class="whitespace-nowrap text-[11px] text-slate-500">Produzir: {{ row.productionCity ?? 'qualquer' }}</p>
                </td>
                <td class="px-3 py-3 text-right">
                  <span class="inline-flex items-center gap-2">
                    <span
                      v-if="getFreshness(row.oldestDate) === 'stale'"
                      class="text-amber-300"
                      :title="`Algum preço usado tem ${formatAge(row.oldestDate)}`"
                      aria-label="Preços antigos"
                    >⚠</span>
                    <button type="button" class="btn btn-primary btn-sm" @click.stop="openCalculator(row.productId)">Calcular</button>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards (mobile) -->
        <ul class="md:hidden divide-y divide-slate-700/50" :class="{ 'opacity-60': scanning }">
          <li v-for="row in pagedRows" :key="row.productId">
            <button type="button" class="w-full p-4 text-left hover:bg-slate-700/20" @click="openCalculator(row.productId)">
              <div class="flex items-center gap-3">
                <div class="relative shrink-0">
                  <ItemIcon :item-id="row.productId" :size="44" />
                  <span class="absolute -left-1 -top-1 rounded bg-slate-800 border border-slate-600 px-1 text-[9px] font-bold text-slate-200">T{{ tierOf(row.productId) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold text-slate-100">
                    {{ craftItemName(row.productId, book!) }}
                    <span :class="ENCHANT_TEXT[enchantOf(row.productId)]">.{{ enchantOf(row.productId) }}</span>
                  </p>
                  <p class="truncate text-[11px] text-slate-500">{{ row.buyCity ?? 'Várias cidades' }} → {{ row.sellCity }}</p>
                </div>
                <MarginBadge :margin="row.margin" />
              </div>
              <dl class="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div class="rounded-lg bg-slate-900/50 py-1.5">
                  <dt class="text-slate-500">Custo/un</dt>
                  <dd class="tabular-nums font-bold text-rose-300">{{ formatShort(row.costPerUnit) }}</dd>
                </div>
                <div class="rounded-lg bg-slate-900/50 py-1.5">
                  <dt class="text-slate-500">Venda líq.</dt>
                  <dd class="tabular-nums font-bold text-emerald-300">{{ formatShort(row.sellNet) }}</dd>
                </div>
                <div class="rounded-lg bg-slate-900/50 py-1.5">
                  <dt class="text-slate-500">Lucro/un</dt>
                  <dd class="tabular-nums font-bold" :class="row.profit >= 0 ? 'text-slate-50' : 'text-rose-300'">{{ formatShort(row.profit) }}</dd>
                </div>
              </dl>
            </button>
          </li>
        </ul>

        <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-slate-700/50 text-xs text-slate-500">
          <span>{{ visibleRows.length }} {{ visibleRows.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas' }}</span>
          <button
            v-if="visibleRows.length > pagedRows.length"
            type="button"
            class="btn btn-ghost btn-sm"
            @click="pageSize += PAGE_SIZE"
          >
            Mostrar mais {{ Math.min(PAGE_SIZE, visibleRows.length - pagedRows.length) }}
          </button>
        </div>
      </template>
    </div>

    <CraftCalculatorModal
      v-if="modalItem && book"
      :key="modalItem"
      :product-id="modalItem"
      :book="book"
      :region="region"
      :defaults="calculatorDefaults"
      :initial-prices="priceIndex"
      @close="closeCalculator"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItemIcon from '@/components/market/ItemIcon.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import CraftCalculatorModal from '@/components/calculator/CraftCalculatorModal.vue'
import { AlbionDataApi, type AlbionRegion } from '@/lib/api'
import {
  CRAFT_CATEGORIES,
  REFINING_CATEGORY,
  REFINING_BONUS_CITY,
  buildPriceIndex,
  craftItemName,
  formatShort,
  loadRecipeBook,
  productsForCategory,
  scanOpportunities,
  type CalculatorDefaults,
  type Opportunity,
  type PriceIndex,
  type RecipeBook,
} from '@/lib/craft'
import {
  CITY_COLORS,
  MARKET_CITIES,
  REGIONS,
  formatAge,
  getFreshness,
  normalizeText,
  parseItemId,
} from '@/lib/market'

/** Selo colorido da margem */
const MarginBadge = defineComponent({
  props: { margin: { type: Number, required: true } },
  setup(props) {
    return () => {
      const pct = props.margin * 100
      const tone =
        pct >= 20 ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40'
        : pct >= 5 ? 'text-amber-300 bg-amber-500/15 border-amber-500/40'
        : pct >= 0 ? 'text-slate-300 bg-slate-700/40 border-slate-600/50'
        : 'text-rose-300 bg-rose-500/15 border-rose-500/40'
      return h(
        'span',
        { class: `inline-block min-w-[4.5rem] rounded-lg border px-2 py-1 text-center tabular-nums text-sm font-bold ${tone}` },
        `${pct > 0 ? '+' : ''}${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`,
      )
    }
  },
})

const STORAGE_KEY = 'calc:settings'
const REGION_KEY = 'market:region'
const MAX_AGE_HOURS = 48
const PAGE_SIZE = 50
const ROYAL_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']
const ENCHANT_TEXT = ['text-[#C6A95D]', 'text-emerald-400', 'text-sky-400', 'text-purple-400', 'text-amber-300']

type SortKey = 'name' | 'cost' | 'sell' | 'profit' | 'margin' | 'return'

const COLUMNS: Array<{ key: SortKey | 'action'; label: string; align: 'left' | 'right'; sortable: boolean }> = [
  { key: 'name', label: 'Item', align: 'left', sortable: true },
  { key: 'cost', label: 'Custo real / un', align: 'right', sortable: true },
  { key: 'sell', label: 'Venda líquida', align: 'right', sortable: true },
  { key: 'profit', label: 'Lucro / un', align: 'right', sortable: true },
  { key: 'margin', label: 'Margem', align: 'right', sortable: true },
  { key: 'return', label: 'Retorno', align: 'right', sortable: true },
  { key: 'action', label: '', align: 'right', sortable: false },
]
const SORT_OPTIONS = COLUMNS.filter((c) => c.sortable) as Array<{ key: SortKey; label: string }>

interface Settings {
  category: string
  tier: number
  enchant: number
  cities: string[]
  /** Percentual; null = automático */
  returnRate: number | null
  focus: boolean
  premium: boolean
  stationFee: number
}

const DEFAULT_SETTINGS: Settings = {
  category: REFINING_CATEGORY,
  tier: 0,
  enchant: -1,
  cities: [...ROYAL_CITIES],
  returnRate: null,
  focus: false,
  premium: true,
  stationFee: 900,
}

const route = useRoute()
const router = useRouter()

// ---------- Estado ----------
const region = ref<AlbionRegion>(readRegion())
const settings = reactive<Settings>(readSettings())
const book = ref<RecipeBook | null>(null)
const priceIndex = ref<PriceIndex>(new Map())
const scannedProducts = ref<string[]>([])
const scannedKey = ref('')
const scanning = ref(false)
const hasScanned = ref(false)
const progress = reactive({ done: 0, total: 0 })
const error = ref('')

const filterText = ref('')
const onlyProfitable = ref(false)
const sortKey = ref<SortKey>('margin')
const sortDir = ref<'asc' | 'desc'>('desc')
const pageSize = ref(PAGE_SIZE)

const citiesOpen = ref(false)
const citiesRef = ref<HTMLElement | null>(null)
const modalItem = ref<string | null>(null)

// ---------- Configuração ----------
const categoryGroups = computed(() => {
  const groups = new Map<string, typeof CRAFT_CATEGORIES>()
  for (const c of CRAFT_CATEGORIES) groups.set(c.group, [...(groups.get(c.group) ?? []), c])
  return [...groups].map(([group, items]) => ({ group, items }))
})

/** O input fica vazio no modo automático */
const returnInput = computed<string | number>({
  get: () => (settings.returnRate === null ? '' : settings.returnRate),
  set: (v) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
    settings.returnRate = String(v).trim() === '' || Number.isNaN(n) ? null : Math.min(90, Math.max(0, n))
  },
})

const calculatorDefaults = computed<CalculatorDefaults>(() => ({
  premium: settings.premium,
  stationFee: Number(settings.stationFee) || 0,
  returnRate: settings.returnRate === null ? null : settings.returnRate / 100,
  focus: settings.focus,
  cities: settings.cities,
}))

/** Filtros que exigem buscar preços de novo (os demais recalculam na hora) */
const fetchKey = computed(() => `${settings.category}|${settings.tier}|${settings.enchant}|${region.value}`)
const scanIsOutdated = computed(() => hasScanned.value && scannedKey.value !== fetchKey.value)

function resetSettings() {
  Object.assign(settings, { ...DEFAULT_SETTINGS, cities: [...DEFAULT_SETTINGS.cities] })
}

watch(settings, (s) => writeStorage(STORAGE_KEY, s), { deep: true })
watch(region, (r) => writeStorage(REGION_KEY, r))

// ---------- Busca ----------
async function scan() {
  if (scanning.value || settings.cities.length === 0) return
  scanning.value = true
  error.value = ''
  progress.done = 0
  progress.total = 0
  citiesOpen.value = false

  try {
    const recipes = (book.value ??= await loadRecipeBook())
    const products = productsForCategory(
      settings.category,
      recipes,
      settings.tier ? [settings.tier] : [],
      settings.enchant >= 0 ? [settings.enchant] : [],
    )
    const ids = new Set(products)
    for (const id of products) for (const ing of recipes.recipes.get(id)?.ingredients ?? []) ids.add(ing.id)

    // Busca todas as cidades para que trocar a seleção recalcule sem nova consulta
    const data = await AlbionDataApi.getPricesBatch([...ids], undefined, [1], region.value, {
      onProgress: (done, total) => Object.assign(progress, { done, total }),
    })
    priceIndex.value = buildPriceIndex(data)
    scannedProducts.value = products
    scannedKey.value = fetchKey.value
    hasScanned.value = true
    pageSize.value = PAGE_SIZE
  } catch (e: any) {
    error.value =
      e?.response?.status === 429
        ? 'Muitas consultas seguidas. Aguarde alguns segundos e tente novamente.'
        : 'Não foi possível consultar os preços agora. Verifique sua conexão e tente novamente.'
  } finally {
    scanning.value = false
  }
}

// Recalcula na hora ao mudar cidades, retorno, foco, premium ou tarifa
const opportunities = computed<Opportunity[]>(() => {
  if (!book.value || !scannedProducts.value.length) return []
  return scanOpportunities(scannedProducts.value, book.value, priceIndex.value, {
    cities: settings.cities,
    returnRate: settings.returnRate === null ? null : settings.returnRate / 100,
    focus: settings.focus,
    premium: settings.premium,
    stationFee: Number(settings.stationFee) || 0,
    maxAgeHours: MAX_AGE_HOURS,
  })
})

// ---------- Lista ----------
function sortValue(row: Opportunity, key: SortKey): number | string {
  switch (key) {
    case 'name':
      return craftItemName(row.productId, book.value!)
    case 'cost':
      return row.costPerUnit
    case 'sell':
      return row.sellNet
    case 'profit':
      return row.profit
    case 'return':
      return row.returnRate
    default:
      return row.margin
  }
}

const visibleRows = computed(() => {
  const needle = normalizeText(filterText.value)
  const dir = sortDir.value === 'asc' ? 1 : -1
  return opportunities.value
    .filter((r) => !onlyProfitable.value || r.profit > 0)
    .filter((r) => !needle || normalizeText(`${craftItemName(r.productId, book.value!)} ${r.productId}`).includes(needle))
    .sort((a, b) => {
      const va = sortValue(a, sortKey.value)
      const vb = sortValue(b, sortKey.value)
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir
      return ((va as number) - (vb as number)) * dir
    })
})

const pagedRows = computed(() => visibleRows.value.slice(0, pageSize.value))

watch([filterText, onlyProfitable, sortKey, sortDir], () => (pageSize.value = PAGE_SIZE))

function setSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = key === 'name' || key === 'cost' ? 'asc' : 'desc'
  }
}

function tierOf(id: string): number {
  return parseItemId(id)?.tier ?? 0
}

function enchantOf(id: string): number {
  return parseItemId(id)?.enchantment ?? 0
}

function isRefining(id: string): boolean {
  const baseId = parseItemId(id)?.baseId
  return !!baseId && baseId in REFINING_BONUS_CITY
}

function pctShort(rate: number): string {
  return `${(rate * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

// ---------- Calculadora (modal) ----------
async function openCalculator(productId: string) {
  book.value ??= await loadRecipeBook()
  if (!book.value.recipes.has(productId)) return
  modalItem.value = productId
  if (route.query.item !== productId) router.replace({ query: { ...route.query, item: productId } })
}

function closeCalculator() {
  modalItem.value = null
  const { item: _item, ...rest } = route.query
  router.replace({ query: rest })
}

// ---------- Persistência ----------
function readSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved || typeof saved !== 'object') throw new Error()
    const merged = { ...DEFAULT_SETTINGS, ...saved } as Settings
    if (!CRAFT_CATEGORIES.some((c) => c.value === merged.category)) merged.category = DEFAULT_SETTINGS.category
    merged.cities = Array.isArray(merged.cities)
      ? merged.cities.filter((c) => (MARKET_CITIES as readonly string[]).includes(c))
      : [...DEFAULT_SETTINGS.cities]
    return merged
  } catch {
    return { ...DEFAULT_SETTINGS, cities: [...DEFAULT_SETTINGS.cities] }
  }
}

function readRegion(): AlbionRegion {
  try {
    const value = JSON.parse(localStorage.getItem(REGION_KEY) ?? '"west"')
    return REGIONS.some((r) => r.value === value) ? value : 'west'
  } catch {
    return 'west'
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage indisponível
  }
}

// ---------- Eventos globais ----------
function onDocumentClick(event: MouseEvent) {
  if (citiesOpen.value && citiesRef.value && !citiesRef.value.contains(event.target as Node)) {
    citiesOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  if (typeof route.query.item === 'string') openCalculator(route.query.item.toUpperCase())
})

onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

