<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-ink-950/80 backdrop-blur-sm sm:p-4"
      @mousedown.self="emit('close')"
    >
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-label="`Calculadora: ${productLabel}`"
        tabindex="-1"
        class="relative flex w-full max-w-6xl flex-col overflow-hidden border border-white/[0.08] bg-ink-900 shadow-pop sm:rounded-2xl sm:max-h-[94vh] outline-none"
        @keydown.esc="emit('close')"
      >
        <!-- CABEÇALHO -->
        <header class="flex items-center gap-3 sm:gap-4 border-b border-white/[0.06] px-4 sm:px-6 py-4">
          <div class="relative shrink-0">
            <ItemIcon :item-id="productId" :size="56" :alt="productLabel" eager />
            <span class="absolute -left-1 -top-1 rounded bg-slate-800 border border-slate-600 px-1 text-[10px] font-bold text-slate-200">
              T{{ parsed?.tier }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-lg sm:text-xl font-black text-slate-50">
              {{ productName }}
              <span :class="ENCHANT_TEXT[parsed?.enchantment ?? 0]">{{ parsed?.tier }}.{{ parsed?.enchantment }}</span>
            </h2>
            <p class="truncate text-xs text-slate-500">
              {{ catalogItem?.category ?? 'Item' }} · <span class="font-mono">{{ productId }}</span>
            </p>
          </div>
          <button type="button" class="hidden sm:inline-flex btn btn-secondary btn-sm" @click="copyLink">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            {{ copied ? 'Link copiado!' : 'Copiar link' }}
          </button>
          <button
            ref="closeRef"
            type="button"
            aria-label="Fechar calculadora"
            class="btn btn-ghost btn-icon btn-sm"
            @click="emit('close')"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </header>

        <div v-if="!recipe" class="p-10 text-center text-slate-400">Este item não possui receita de craft.</div>

        <div v-else class="grid grid-cols-1 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden lg:grid-cols-2">
          <!-- ===================== CALCULADORA ===================== -->
          <div class="space-y-4 p-4 sm:p-6 lg:overflow-y-auto">
            <p v-if="error" role="alert" class="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {{ error }}
            </p>

            <!-- Investimento -->
            <section class="calc-card">
              <h3 class="calc-title">Investimento</h3>
              <div class="segmented" role="group" aria-label="Tipo de investimento">
                <button type="button" :aria-pressed="mode === 'value'" :class="{ active: mode === 'value' }" @click="setMode('value')">
                  Valor investido
                </button>
                <button type="button" :aria-pressed="mode === 'quantity'" :class="{ active: mode === 'quantity' }" @click="setMode('quantity')">
                  Quantidade objetivo
                </button>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <label class="sr-only" for="calc-amount">{{ mode === 'value' ? 'Prata a investir' : 'Unidades a produzir' }}</label>
                <input id="calc-amount" v-model.number="amount" type="number" min="0" :step="mode === 'value' ? 100000 : 1" class="calc-input w-40 text-right" />
                <button
                  v-for="p in presets"
                  :key="p"
                  type="button"
                  class="chip"
                  :class="{ 'chip-active': amount === p }"
                  @click="amount = p"
                >
                  {{ mode === 'value' ? formatShort(p) : p.toLocaleString('pt-BR') }}
                </button>
              </div>
            </section>

            <!-- Compra -->
            <section class="calc-card">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 class="calc-title">Forma de comprar</h3>
                  <div class="segmented" role="group" aria-label="Forma de comprar">
                    <button type="button" :aria-pressed="buyMode === 'direct'" :class="{ active: buyMode === 'direct' }" @click="buyMode = 'direct'">
                      Compra direta
                    </button>
                    <button type="button" :aria-pressed="buyMode === 'order'" :class="{ active: buyMode === 'order' }" @click="buyMode = 'order'">
                      Pedido de compra
                    </button>
                  </div>
                </div>
                <label class="block">
                  <span class="field-label">Onde comprar</span>
                  <select v-model="buyCity" class="calc-select">
                    <option value="best">Melhor por item</option>
                    <option v-for="c in buyCities" :key="c" :value="c">{{ c }}</option>
                  </select>
                </label>
              </div>

              <div class="mt-3 -mx-1 overflow-x-auto">
                <table class="w-full min-w-[440px] text-xs lg:min-w-0">
                  <thead>
                    <tr class="text-[10px] uppercase tracking-wider text-slate-500">
                      <th scope="col" class="px-1 py-2 text-left font-bold">Item</th>
                      <th scope="col" class="px-1 py-2 text-right font-bold">Qtd</th>
                      <th scope="col" class="px-1 py-2 text-right font-bold">Valor un.</th>
                      <th scope="col" class="px-1 py-2 text-right font-bold">Taxa</th>
                      <th scope="col" class="px-1 py-2 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800">
                    <tr v-for="line in plan.lines" :key="line.id">
                      <th scope="row" class="px-1 py-2 text-left font-medium">
                        <span class="flex items-center gap-2">
                          <ItemIcon :item-id="line.id" :size="28" />
                          <span class="min-w-0">
                            <span class="block max-w-[9.5rem] truncate text-slate-200 xl:max-w-[13rem]" :title="craftItemLabel(line.id, book)">{{ craftItemLabel(line.id, book) }}</span>
                            <span class="block text-[10px] text-slate-500">
                              {{ line.count }} por craft
                              <template v-if="ingredientCity(line.id)"> · {{ ingredientCity(line.id) }}</template>
                              <span
                                v-if="priceOverrides[line.id] === undefined && ingredientReference(line.id)"
                                :class="ageClass(ingredientReference(line.id)!.date)"
                                :title="ageTitle(ingredientReference(line.id)!.date)"
                              > · há {{ formatAge(ingredientReference(line.id)!.date) }}</span>
                              <span v-if="!line.returns" class="ml-1 rounded bg-slate-700/60 px-1 text-slate-300" title="Não é devolvido pela taxa de retorno">não retorna</span>
                            </span>
                          </span>
                        </span>
                      </th>
                      <td class="px-1 py-2 text-right tabular-nums text-slate-200">{{ line.quantity.toLocaleString('pt-BR') }}</td>
                      <td class="px-1 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          :value="ingredientPrices[line.id] || ''"
                          :placeholder="'sem preço'"
                          :aria-label="`Preço unitário de ${craftItemLabel(line.id, book)}`"
                          class="calc-input w-20 py-1 text-right text-xs xl:w-24"
                          :class="{ 'border-rose-500/60': !ingredientPrices[line.id], 'border-amber-500/60': priceOverrides[line.id] !== undefined }"
                          @change="setIngredientPrice(line.id, ($event.target as HTMLInputElement).value)"
                        />
                      </td>
                      <td class="px-1 py-2 text-right tabular-nums text-slate-500">{{ line.fee ? formatShort(line.fee) : '—' }}</td>
                      <td class="px-1 py-2 text-right tabular-nums text-slate-100">{{ formatShort(line.total) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="border-t border-slate-700">
                      <th scope="row" colspan="4" class="px-1 py-2 text-left text-xs font-bold uppercase text-slate-400">Total</th>
                      <td class="px-1 py-2 text-right tabular-nums font-bold text-slate-50">{{ formatShort(plan.materialsTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p v-if="missingPrices.length" class="mt-2 text-xs text-rose-300">
                Sem preço para {{ missingPrices.length === 1 ? 'um ingrediente' : `${missingPrices.length} ingredientes` }} nesta cidade. Informe o valor manualmente ou escolha outra cidade.
              </p>
              <p v-if="stalePrices" class="mt-2 text-[11px] text-amber-300/90">
                Alguns preços têm mais de 2h. Eles vêm do Albion Data Project, que só é atualizado quando algum jogador
                com o cliente de dados abre o mercado. Confira no jogo e corrija o valor se precisar.
              </p>
              <p v-if="!missingPrices.length && buyMode === 'order'" class="mt-2 text-[11px] text-slate-500">
                Pedido de compra usa a maior ordem de compra como referência e cobra {{ pct(SETUP_FEE) }} de taxa.
              </p>
            </section>

            <!-- Custo de craft -->
            <section class="calc-card">
              <h3 class="calc-title">Custo de craft</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label class="col-span-2 block">
                  <span class="field-label">Onde produzir</span>
                  <select v-model="productionCity" class="calc-select w-full">
                    <option v-if="bonusCity" value="best">Melhor · {{ bonusCity }}</option>
                    <option v-else value="best">Qualquer cidade</option>
                    <option v-for="c in PRODUCTION_CITIES" :key="c" :value="c">{{ c }}{{ c === bonusCity ? ' (bônus)' : '' }}</option>
                  </select>
                </label>
                <label class="block">
                  <span class="field-label flex items-center gap-1">
                    Retorno %
                    <button
                      v-if="returnOverride !== null"
                      type="button"
                      class="text-gold-400 hover:text-gold-300"
                      title="Voltar ao cálculo automático"
                      @click="returnOverride = null"
                    >
                      (auto)
                    </button>
                  </span>
                  <input v-model.number="returnPercent" type="number" min="0" max="90" step="0.1" class="calc-input w-full text-right" />
                </label>
                <label class="block">
                  <span class="field-label">Tarifa estação</span>
                  <input v-model.number="stationFee" type="number" min="0" step="50" class="calc-input w-full text-right" />
                </label>
              </div>
              <label class="mt-3 inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input v-model="focus" type="checkbox" />
                Usar foco
                <span class="text-slate-500">(+{{ PRODUCTION_BONUS.focus }}% de bônus de produção)</span>
              </label>

              <dl class="mt-3 divide-y divide-slate-800 text-sm">
                <div class="calc-row">
                  <dt>Crafts com o retorno</dt>
                  <dd>{{ plan.materialCrafts.toLocaleString('pt-BR') }} → {{ plan.outputCrafts.toLocaleString('pt-BR') }} <span class="text-slate-500">(×{{ multiplier }})</span></dd>
                </div>
                <div class="calc-row">
                  <dt>Tarifa da estação <span class="text-slate-500">({{ formatShort(plan.stationPerCraft) }} × {{ plan.outputCrafts.toLocaleString('pt-BR') }})</span></dt>
                  <dd>{{ formatShort(plan.stationTotal) }}</dd>
                </div>
                <div class="calc-row">
                  <dt>Quantidade final</dt>
                  <dd>{{ plan.units.toLocaleString('pt-BR') }} <span class="text-slate-500">un.</span></dd>
                </div>
                <div class="calc-row font-bold">
                  <dt class="text-slate-200">Custo total</dt>
                  <dd class="text-slate-50">{{ formatShort(plan.totalCost) }}</dd>
                </div>
              </dl>
            </section>

            <!-- Resultado -->
            <section class="calc-card">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 class="calc-title">Resultado</h3>
                  <div class="segmented" role="group" aria-label="Forma de vender">
                    <button type="button" :aria-pressed="sellMode === 'order'" :class="{ active: sellMode === 'order' }" @click="sellMode = 'order'">
                      Ordem de venda
                    </button>
                    <button type="button" :aria-pressed="sellMode === 'instant'" :class="{ active: sellMode === 'instant' }" @click="sellMode = 'instant'">
                      Venda imediata
                    </button>
                  </div>
                </div>
                <label class="block">
                  <span class="field-label">Onde vender</span>
                  <select v-model="sellCity" class="calc-select">
                    <option value="best">Melhor{{ defaultSell ? ` · ${defaultSell.city}` : '' }}</option>
                    <option v-for="c in sellCities" :key="c" :value="c">{{ c }}</option>
                  </select>
                </label>
              </div>
              <label class="mt-3 inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input v-model="premium" type="checkbox" />
                Premium <span class="text-slate-500">(imposto de {{ pct(salesTaxRate(premium)) }})</span>
              </label>

              <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-slate-900/50 px-3 py-2 text-xs">
                <span class="flex min-w-0 basis-full sm:basis-0 flex-1 items-center gap-2">
                  <ItemIcon :item-id="productId" :size="28" />
                  <span class="truncate text-slate-200">{{ plan.units.toLocaleString('pt-BR') }} × {{ productName }}</span>
                </span>
                <label class="flex items-center gap-1.5 text-slate-500">
                  Preço
                  <input
                    type="number"
                    min="0"
                    :value="sellPrice || ''"
                    placeholder="sem preço"
                    class="calc-input w-20 py-1 text-right text-xs xl:w-24"
                    :class="{ 'border-rose-500/60': !sellPrice, 'border-amber-500/60': sellPriceOverride !== null }"
                    @change="setSellPrice(($event.target as HTMLInputElement).value)"
                  />
                </label>
                <span
                  v-if="sellPriceOverride === null && defaultSell?.date"
                  class="tabular-nums"
                  :class="ageClass(defaultSell.date)"
                  :title="ageTitle(defaultSell.date)"
                >há {{ formatAge(defaultSell.date) }}</span>
                <span class="tabular-nums text-rose-300" :title="`Taxas: ${pct(sellFeeRate)}`">-{{ formatShort(plan.sellFee) }}</span>
                <span class="tabular-nums font-bold text-slate-50">{{ formatShort(plan.net) }}</span>
              </div>
              <p class="mt-2 text-[11px] text-slate-500">
                {{ sellMode === 'order'
                  ? `Ordem de venda: imposto ${pct(salesTaxRate(premium))} + taxa de anúncio ${pct(SETUP_FEE)}. Referência: menor ordem de venda.`
                  : `Venda imediata para a maior ordem de compra: só o imposto de ${pct(salesTaxRate(premium))}.` }}
              </p>
            </section>

            <!-- Lucro -->
            <section
              class="sticky bottom-0 rounded-xl border p-4 shadow-xl backdrop-blur"
              :class="plan.profit >= 0
                ? 'border-emerald-500/40 bg-emerald-950/80'
                : 'border-rose-500/40 bg-rose-950/80'"
              aria-live="polite"
            >
              <div class="flex items-end justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider" :class="plan.profit >= 0 ? 'text-emerald-300' : 'text-rose-300'">
                    {{ plan.profit >= 0 ? 'Lucro estimado' : 'Prejuízo estimado' }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-400">
                    {{ plan.units ? `${formatShort(plan.profit / plan.units)} por unidade` : 'Ajuste o investimento' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl sm:text-3xl font-black" :class="plan.profit >= 0 ? 'text-emerald-200' : 'text-rose-200'">
                    {{ plan.profit > 0 ? '+' : '' }}{{ formatShort(plan.profit) }}
                  </p>
                  <p class="text-xs font-semibold" :class="plan.profit >= 0 ? 'text-emerald-300/80' : 'text-rose-300/80'">
                    Margem {{ (plan.margin * 100).toFixed(1).replace('.', ',') }}%
                  </p>
                </div>
              </div>
            </section>
          </div>

          <!-- ===================== PREÇOS POR CIDADE ===================== -->
          <aside class="space-y-4 border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-ink-950/40 p-4 sm:p-6 lg:overflow-y-auto">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold text-slate-50">Preços por cidade</h3>
              <div class="segmented small" role="group" aria-label="Período do histórico">
                <button
                  v-for="p in PERIODS"
                  :key="p"
                  type="button"
                  :aria-pressed="period === p"
                  :class="{ active: period === p }"
                  @click="period = p"
                >
                  {{ p }}d
                </button>
              </div>
            </div>
            <p v-if="loadingPrices" class="text-xs text-slate-500">Atualizando preços...</p>

            <CityPricesPanel
              :item-id="productId"
              :label="productLabel"
              :role="`Produto · vender em ${defaultSell?.city ?? '—'}`"
              :prices="prices"
              :history="history"
              :loading-history="loadingHistory"
              :highlight="defaultSell ? [defaultSell.city] : []"
            />
            <CityPricesPanel
              v-for="ing in recipe.ingredients"
              :key="ing.id"
              :item-id="ing.id"
              :label="craftItemLabel(ing.id, book)"
              :role="`Ingrediente · ${ing.count} por craft${ingredientCity(ing.id) ? ` · comprar em ${ingredientCity(ing.id)}` : ''}`"
              :prices="prices"
              :history="history"
              :loading-history="loadingHistory"
              :highlight="ingredientCity(ing.id) ? [ingredientCity(ing.id)!] : []"
            />
          </aside>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ItemIcon from '@/components/market/ItemIcon.vue'
import CityPricesPanel from '@/components/calculator/CityPricesPanel.vue'
import { AlbionDataApi, type AlbionHistoryData, type AlbionRegion } from '@/lib/api'
import {
  PRODUCTION_BONUS,
  PRODUCTION_CITIES,
  SETUP_FEE,
  bestPrice,
  buildPriceIndex,
  craftItemLabel,
  craftItemName,
  defaultReturnRate,
  formatShort,
  planCraft,
  priceAt,
  refiningBonusCity,
  salesTaxRate,
  type CalculatorDefaults,
  type PriceIndex,
  type RecipeBook,
} from '@/lib/craft'
import { MARKET_CITIES, findCatalogItem, formatAge, formatApiDate, getFreshness, parseItemId } from '@/lib/market'

const props = defineProps<{
  productId: string
  book: RecipeBook
  region: AlbionRegion
  defaults: CalculatorDefaults
  /** Preços já carregados pelo scanner (exibidos enquanto os atuais chegam) */
  initialPrices?: PriceIndex
}>()

const emit = defineEmits<{ close: [] }>()

const ENCHANT_TEXT = ['text-[#C6A95D]', 'text-emerald-400', 'text-sky-400', 'text-purple-400', 'text-amber-300']
const VALUE_PRESETS = [1_000_000, 10_000_000, 50_000_000]
const QUANTITY_PRESETS = [10, 100, 1000]
const PERIODS = [7, 30, 90] as const

const router = useRouter()
const dialogRef = ref<HTMLElement | null>(null)
const closeRef = ref<HTMLButtonElement | null>(null)

// ---------- Item ----------
const recipe = computed(() => props.book.recipes.get(props.productId))
const parsed = computed(() => parseItemId(props.productId))
const catalogItem = computed(() => (parsed.value ? findCatalogItem(parsed.value.baseId) : undefined))
const productName = computed(() => craftItemName(props.productId, props.book))
const productLabel = computed(() => craftItemLabel(props.productId, props.book))
const bonusCity = computed(() => refiningBonusCity(props.productId))

// ---------- Dados ----------
const prices = ref<PriceIndex>(props.initialPrices ?? new Map())
const history = ref<AlbionHistoryData[]>([])
const loadingPrices = ref(false)
const loadingHistory = ref(false)
const error = ref('')
const period = ref<(typeof PERIODS)[number]>(30)
const copied = ref(false)

const itemIds = computed(() => [props.productId, ...(recipe.value?.ingredients.map((i) => i.id) ?? [])])

async function loadPrices() {
  if (!recipe.value) return
  loadingPrices.value = true
  error.value = ''
  try {
    const data = await AlbionDataApi.getPrices(itemIds.value, undefined, [1], props.region)
    prices.value = buildPriceIndex(data)
  } catch {
    error.value = 'Não foi possível atualizar os preços. Os valores podem estar desatualizados.'
  } finally {
    loadingPrices.value = false
  }
}

let historyRequest = 0
async function loadHistory() {
  if (!recipe.value) return
  const id = ++historyRequest
  loadingHistory.value = true
  try {
    const data = await AlbionDataApi.getHistory(itemIds.value, {
      date: formatApiDate(new Date(Date.now() - period.value * 86_400_000)),
      qualities: [1],
      timeScale: 24,
      region: props.region,
    })
    if (id === historyRequest) history.value = data
  } catch {
    if (id === historyRequest) history.value = []
  } finally {
    if (id === historyRequest) loadingHistory.value = false
  }
}

watch(period, loadHistory)
watch(
  () => [props.productId, props.region],
  () => {
    loadPrices()
    loadHistory()
  },
  { immediate: true },
)

// ---------- Investimento ----------
const mode = ref<'value' | 'quantity'>('value')
const amount = ref(VALUE_PRESETS[0])
const presets = computed(() => (mode.value === 'value' ? VALUE_PRESETS : QUANTITY_PRESETS))

function setMode(next: 'value' | 'quantity') {
  if (mode.value === next) return
  mode.value = next
  amount.value = next === 'value' ? VALUE_PRESETS[0] : QUANTITY_PRESETS[1]
}

// ---------- Compra ----------
const buyMode = ref<'direct' | 'order'>('direct')
const buyCity = ref<string>('best')
const priceOverrides = ref<Record<string, number>>({})

const buyCities = computed(() => {
  const selected = props.defaults.cities.filter((c) => c !== 'Black Market')
  return selected.length ? selected : MARKET_CITIES.filter((c) => c !== 'Black Market')
})

watch([buyMode, buyCity], () => (priceOverrides.value = {}))

/** Cidade e preço de referência de cada ingrediente */
function ingredientReference(id: string) {
  const kind = buyMode.value === 'direct' ? 'sell' : 'buy'
  if (buyCity.value === 'best') {
    // Pedido de compra: a cidade com a menor ordem de compra é onde sai mais barato
    return bestPrice(prices.value, id, buyCities.value, kind, Infinity, Date.now(), 'low')
  }
  return priceAt(prices.value, id, buyCity.value, kind)
}

function ingredientCity(id: string): string | null {
  if (buyCity.value !== 'best') return buyCity.value
  return ingredientReference(id)?.city ?? null
}

const ingredientPrices = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  for (const ing of recipe.value?.ingredients ?? []) {
    result[ing.id] = priceOverrides.value[ing.id] ?? ingredientReference(ing.id)?.price ?? 0
  }
  return result
})

function ageClass(date: string) {
  return getFreshness(date) === 'fresh' ? 'text-emerald-400' : 'text-amber-400'
}

function ageTitle(date: string) {
  return `Preço registrado há ${formatAge(date)} no Albion Data Project. O valor no jogo pode ter mudado.`
}

/** Algum preço usado no cálculo (sem valor manual) tem mais de 2h */
const stalePrices = computed(() => {
  const ingredients = (recipe.value?.ingredients ?? []).some((i) => {
    if (priceOverrides.value[i.id] !== undefined) return false
    const ref = ingredientReference(i.id)
    return !!ref && getFreshness(ref.date) !== 'fresh'
  })
  const sell = sellPriceOverride.value === null && !!defaultSell.value?.date && getFreshness(defaultSell.value.date) !== 'fresh'
  return ingredients || sell
})

const missingPrices = computed(() => (recipe.value?.ingredients ?? []).filter((i) => !ingredientPrices.value[i.id]))

function setIngredientPrice(id: string, raw: string) {
  const value = Number(raw)
  const next = { ...priceOverrides.value }
  if (raw === '' || Number.isNaN(value)) delete next[id]
  else next[id] = Math.max(0, value)
  priceOverrides.value = next
}

// ---------- Produção ----------
const productionCity = ref<string>('best')
const focus = ref(props.defaults.focus)
const stationFee = ref(props.defaults.stationFee)
const returnOverride = ref<number | null>(props.defaults.returnRate !== null ? props.defaults.returnRate * 100 : null)

const resolvedProductionCity = computed(() =>
  productionCity.value === 'best' ? bonusCity.value : productionCity.value,
)
const autoReturnRate = computed(() => defaultReturnRate(props.productId, resolvedProductionCity.value, focus.value))

const returnPercent = computed<number>({
  get: () => returnOverride.value ?? Math.round(autoReturnRate.value * 1000) / 10,
  set: (v) => (returnOverride.value = typeof v === 'number' && !Number.isNaN(v) ? Math.min(90, Math.max(0, v)) : null),
})
const returnRate = computed(() => returnPercent.value / 100)
const multiplier = computed(() => (1 / (1 - returnRate.value)).toFixed(1).replace('.', ','))

// ---------- Venda ----------
const sellMode = ref<'order' | 'instant'>('order')
const sellCity = ref<string>('best')
const premium = ref(props.defaults.premium)
const sellPriceOverride = ref<number | null>(null)

const sellCities = computed(() =>
  sellMode.value === 'order' ? buyCities.value : [...buyCities.value, 'Black Market'],
)

watch([sellMode, sellCity], () => (sellPriceOverride.value = null))
watch(sellMode, () => {
  if (sellCity.value !== 'best' && !sellCities.value.includes(sellCity.value)) sellCity.value = 'best'
})

const defaultSell = computed(() => {
  const kind = sellMode.value === 'order' ? 'sell' : 'buy'
  if (sellCity.value === 'best') {
    return bestPrice(prices.value, props.productId, sellCities.value, kind, Infinity, Date.now(), 'high')
  }
  return priceAt(prices.value, props.productId, sellCity.value, kind) ?? { city: sellCity.value, price: 0, date: '' }
})

const sellPrice = computed(() => sellPriceOverride.value ?? defaultSell.value?.price ?? 0)
const sellFeeRate = computed(() => salesTaxRate(premium.value) + (sellMode.value === 'order' ? SETUP_FEE : 0))

function setSellPrice(raw: string) {
  const value = Number(raw)
  sellPriceOverride.value = raw === '' || Number.isNaN(value) ? null : Math.max(0, value)
}

// ---------- Plano ----------
const plan = computed(() =>
  planCraft({
    recipe: recipe.value ?? { productId: props.productId, amount: 1, itemValue: 0, silver: 0, ingredients: [] },
    mode: mode.value,
    amount: Number(amount.value) || 0,
    ingredientPrices: ingredientPrices.value,
    buyFeeRate: buyMode.value === 'order' ? SETUP_FEE : 0,
    returnRate: returnRate.value,
    stationFee: Number(stationFee.value) || 0,
    sellPrice: sellPrice.value,
    sellFeeRate: sellFeeRate.value,
  }),
)

// ---------- Utilidades ----------
function pct(rate: number): string {
  return `${(rate * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

async function copyLink() {
  const href = router.resolve({ name: 'calculator', query: { item: props.productId } }).href
  try {
    await navigator.clipboard.writeText(new URL(href, window.location.origin).toString())
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard indisponível
  }
}

// Trava a rolagem da página enquanto o modal está aberto
let previousOverflow = ''
onMounted(() => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  nextTick(() => closeRef.value?.focus())
})
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
})
</script>

<style scoped>
/* Variações locais com os mesmos tokens do design system (style.css) */
.calc-card {
  @apply rounded-xl border border-white/[0.05] bg-white/[0.015] p-4;
}
.calc-title {
  @apply mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-gold-500;
}
.field-label {
  @apply mb-1.5 block text-xs font-medium text-slate-400;
}
.calc-input,
.calc-select {
  @apply h-9 rounded-lg border border-white/10 bg-ink-850 px-3 text-sm tabular-nums text-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] transition-colors placeholder:text-slate-500 hover:border-white/20 focus:border-gold-500/60 focus:outline-none focus:ring-2 focus:ring-gold-500/15;
}
.calc-row {
  @apply flex items-baseline justify-between gap-3 py-2 text-slate-400;
}
.calc-row dd {
  @apply text-right tabular-nums text-slate-200;
}
.segmented {
  @apply inline-flex rounded-lg border border-white/[0.08] bg-ink-850 p-0.5;
}
.segmented button {
  @apply h-8 rounded-md px-3 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-100;
}
.segmented button.active {
  @apply bg-ink-600 text-gold-200 ring-1 ring-inset ring-gold-500/30;
}
.segmented.small button {
  @apply h-7 px-2 text-[11px];
}
.chip-active {
  @apply border-gold-500/50 bg-gold-500/10 text-gold-200;
}
</style>
