<template>
  <section class="rounded-xl border border-white/[0.06] bg-ink-900/70">
    <header class="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
      <ItemIcon :item-id="itemId" :size="36" :alt="label" />
      <div class="min-w-0">
        <h4 class="truncate text-sm font-bold text-slate-100">{{ label }}</h4>
        <p v-if="role" class="text-[11px] text-slate-500">{{ role }}</p>
      </div>
    </header>

    <table class="w-full text-xs">
      <thead>
        <tr class="text-[10px] uppercase tracking-wider text-slate-500">
          <th scope="col" class="px-4 py-2 text-left font-bold">Cidade</th>
          <th scope="col" class="px-4 py-2 text-right font-bold" title="Menor ordem de venda">Venda</th>
          <th scope="col" class="px-4 py-2 text-right font-bold" title="Maior ordem de compra">Compra</th>
          <th scope="col" class="px-4 py-2 text-right font-bold">Idade</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800">
        <tr
          v-for="city in MARKET_CITIES"
          :key="city"
          :class="highlight.includes(city) ? 'bg-gold-500/[0.08]' : ''"
        >
          <th scope="row" class="px-4 py-1.5 text-left font-medium">
            <span class="flex items-center gap-2" :class="highlight.includes(city) ? 'text-gold-200' : 'text-slate-300'">
              <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: CITY_COLORS[city] }" />
              {{ city }}
            </span>
          </th>
          <td class="px-4 py-1.5 text-right tabular-nums text-slate-200">{{ show(city, 'sell') }}</td>
          <td class="px-4 py-1.5 text-right tabular-nums text-slate-400">{{ show(city, 'buy') }}</td>
          <td class="px-4 py-1.5 text-right">
            <span class="inline-flex items-center gap-1 text-slate-500">
              <span class="h-1.5 w-1.5 rounded-full" :class="AGE_DOT[getFreshness(latest(city))]" />
              {{ formatAge(latest(city)) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="px-4 pb-4 pt-3 border-t border-white/[0.06]">
      <div v-if="loadingHistory" class="h-40 rounded-lg bg-white/[0.04] animate-pulse" />
      <PriceHistoryChart v-else-if="series.length" :series="series" />
      <p v-else class="py-6 text-center text-xs text-slate-500">Sem histórico no período</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import PriceHistoryChart from '@/components/market/PriceHistoryChart.vue'
import type { AlbionHistoryData } from '@/lib/api'
import { formatShort, type PriceIndex } from '@/lib/craft'
import { CITY_COLORS, MARKET_CITIES, buildChartSeries, formatAge, getFreshness, hasDate } from '@/lib/market'

const props = withDefaults(
  defineProps<{
    itemId: string
    label: string
    role?: string
    prices: PriceIndex
    history: AlbionHistoryData[]
    loadingHistory?: boolean
    /** Cidades destacadas (onde comprar / vender) */
    highlight?: string[]
  }>(),
  { role: '', loadingHistory: false, highlight: () => [] },
)

const AGE_DOT = {
  fresh: 'bg-emerald-400',
  recent: 'bg-amber-400',
  stale: 'bg-rose-500',
  none: 'bg-slate-600',
}

const byCity = computed(() => props.prices.get(props.itemId))
const series = computed(() => buildChartSeries(props.history.filter((h) => h.item_id === props.itemId)))

function show(city: string, kind: 'sell' | 'buy'): string {
  const p = byCity.value?.get(city)
  const value = kind === 'sell' ? p?.sell_price_min : p?.buy_price_max
  return value ? formatShort(value) : '—'
}

function latest(city: string): string {
  const p = byCity.value?.get(city)
  if (!p) return ''
  return [p.sell_price_min ? p.sell_price_min_date : '', p.buy_price_max ? p.buy_price_max_date : '']
    .filter(hasDate)
    .sort()
    .pop() ?? ''
}
</script>
