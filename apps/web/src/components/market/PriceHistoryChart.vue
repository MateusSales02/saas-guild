<template>
  <div>
    <!-- Legenda / filtro de cidades -->
    <div class="flex flex-wrap gap-2 mb-4" role="group" aria-label="Cidades exibidas no gráfico">
      <button
        v-for="s in series"
        :key="s.city"
        type="button"
        :aria-pressed="!hidden.has(s.city)"
        @click="toggleCity(s.city)"
        class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
        :class="hidden.has(s.city)
          ? 'border-slate-700/50 bg-slate-900/40 text-slate-500 line-through'
          : 'border-slate-600/60 bg-slate-800/60 text-slate-200 hover:border-amber-500/50'"
      >
        <span
          class="h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: hidden.has(s.city) ? 'transparent' : s.color, border: `2px solid ${s.color}` }"
        />
        {{ s.city }}
      </button>
    </div>

    <div v-if="visibleSeries.length === 0" class="py-12 text-center text-sm text-slate-500">
      Selecione ao menos uma cidade para exibir o gráfico
    </div>

    <div v-else ref="wrapperRef" class="relative touch-pan-y">
      <svg
        v-if="width > 0"
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        class="block select-none"
        role="img"
        aria-label="Histórico de preço médio por cidade"
        @pointermove="onMove"
        @pointerdown="onMove"
        @pointerleave="hoverIndex = null"
      >
        <!-- Grade horizontal -->
        <g v-for="tick in yTicks" :key="`y-${tick}`">
          <line
            :x1="PAD.left"
            :x2="width - PAD.right"
            :y1="yScale(tick)"
            :y2="yScale(tick)"
            stroke="#334155"
            stroke-opacity="0.5"
            stroke-dasharray="3 4"
          />
          <text :x="PAD.left - 8" :y="yScale(tick) + 4" text-anchor="end" fill="#64748b" font-size="11">
            {{ formatCompact(tick) }}
          </text>
        </g>

        <!-- Eixo X -->
        <text
          v-for="tick in xTicks"
          :key="`x-${tick}`"
          :x="xScale(tick)"
          :y="height - 8"
          text-anchor="middle"
          fill="#64748b"
          font-size="11"
        >
          {{ formatDay(tick) }}
        </text>

        <!-- Linhas -->
        <g v-for="s in visibleSeries" :key="s.city">
          <path
            :d="linePath(s)"
            fill="none"
            :stroke="s.color"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-opacity="0.9"
          />
          <!-- Pontos reais: em itens de baixo volume mostram em quais dias houve negociação -->
          <template v-if="s.points.length <= SPARSE_LIMIT">
            <circle
              v-for="p in s.points"
              :key="p.t"
              :cx="xScale(p.t)"
              :cy="yScale(p.v)"
              r="2.5"
              :fill="s.color"
            />
          </template>
        </g>

        <!-- Hover -->
        <g v-if="hoverTime !== null">
          <line
            :x1="xScale(hoverTime)"
            :x2="xScale(hoverTime)"
            :y1="PAD.top"
            :y2="height - PAD.bottom"
            stroke="#C6A95D"
            stroke-opacity="0.6"
          />
          <circle
            v-for="h in hoverValues"
            :key="`dot-${h.city}`"
            :cx="xScale(hoverTime)"
            :cy="yScale(h.v)"
            r="4"
            :fill="h.color"
            stroke="#0f172a"
            stroke-width="2"
          />
        </g>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="hoverTime !== null && hoverValues.length"
        class="pointer-events-none absolute top-1 z-10 w-max max-w-[calc(100%-1rem)] rounded-lg border border-slate-700/70 bg-slate-950/95 p-3 shadow-xl"
        :style="tooltipStyle"
      >
        <p class="mb-2 text-xs font-bold text-[#C6A95D]">{{ formatFullDay(hoverTime) }}</p>
        <div v-for="h in hoverValues" :key="`tip-${h.city}`" class="flex items-center justify-between gap-4 text-xs">
          <span class="flex items-center gap-1.5 text-slate-300">
            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: h.color }" />
            {{ h.city }}
          </span>
          <span class="font-mono font-semibold text-slate-100">
            {{ formatSilver(h.v) }}
            <span class="text-slate-500 font-normal">· {{ formatCompact(h.count) }} un</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { formatCompact, formatSilver, type ChartSeries } from '@/lib/market'

const props = defineProps<{ series: ChartSeries[] }>()

const PAD = { top: 16, right: 16, bottom: 30, left: 52 }
const DAY = 86_400_000
/** Séries com até este número de pontos exibem marcadores em cada dia negociado */
const SPARSE_LIMIT = 25

const wrapperRef = ref<HTMLDivElement | null>(null)
const width = ref(0)
const height = computed(() => (width.value < 500 ? 220 : 280))
const hidden = ref(new Set<string>())
const hoverIndex = ref<number | null>(null)

// O SVG usa a largura real do container para o texto não encolher em telas pequenas
let observer: ResizeObserver | null = null
watch(wrapperRef, (el) => {
  observer?.disconnect()
  if (!el) return
  width.value = el.clientWidth
  observer = new ResizeObserver((entries) => {
    width.value = Math.floor(entries[0].contentRect.width)
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const visibleSeries = computed(() => props.series.filter((s) => !hidden.value.has(s.city)))

function toggleCity(city: string) {
  const next = new Set(hidden.value)
  if (next.has(city)) next.delete(city)
  else next.add(city)
  hidden.value = next
}

const allTimes = computed(() => {
  const set = new Set<number>()
  for (const s of visibleSeries.value) for (const p of s.points) set.add(p.t)
  return [...set].sort((a, b) => a - b)
})

const xDomain = computed<[number, number]>(() => {
  const times = allTimes.value
  if (times.length === 0) return [0, 1]
  if (times.length === 1) return [times[0] - DAY, times[0] + DAY]
  return [times[0], times[times.length - 1]]
})

const yDomain = computed<[number, number]>(() => {
  let min = Infinity
  let max = -Infinity
  for (const s of visibleSeries.value) {
    for (const p of s.points) {
      min = Math.min(min, p.v)
      max = Math.max(max, p.v)
    }
  }
  if (!Number.isFinite(min)) return [0, 1]
  const pad = (max - min) * 0.1 || max * 0.1 || 1
  return [Math.max(0, min - pad), max + pad]
})

function xScale(t: number): number {
  const [a, b] = xDomain.value
  return PAD.left + ((t - a) / (b - a)) * (width.value - PAD.left - PAD.right)
}

function yScale(v: number): number {
  const [a, b] = yDomain.value
  return height.value - PAD.bottom - ((v - a) / (b - a)) * (height.value - PAD.top - PAD.bottom)
}

const yTicks = computed(() => {
  const [a, b] = yDomain.value
  const step = niceStep((b - a) / 4)
  const ticks: number[] = []
  for (let v = Math.ceil(a / step) * step; v <= b; v += step) ticks.push(v)
  return ticks
})

// Rótulos de data espaçados uniformemente conforme a largura disponível
const xTicks = computed(() => {
  const [a, b] = xDomain.value
  if (allTimes.value.length === 0) return []
  const count = Math.max(3, Math.min(7, Math.floor((width.value - PAD.left - PAD.right) / 70)))
  const span = Math.max(1, Math.round((b - a) / DAY / (count - 1))) * DAY
  const ticks: number[] = []
  for (let t = a; t <= b + 1; t += span) ticks.push(t)
  return ticks
})

function niceStep(raw: number): number {
  if (raw <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / exp
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return nice * exp
}

function linePath(s: ChartSeries): string {
  return s.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.t).toFixed(1)},${yScale(p.v).toFixed(1)}`)
    .join(' ')
}

const hoverTime = computed(() =>
  hoverIndex.value === null ? null : (allTimes.value[hoverIndex.value] ?? null),
)

const hoverValues = computed(() => {
  const t = hoverTime.value
  if (t === null) return []
  return visibleSeries.value
    .map((s) => {
      const p = s.points.find((pt) => pt.t === t)
      return p ? { city: s.city, color: s.color, v: p.v, count: p.count } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.v - a.v)
})

// Tooltip do lado oposto ao cursor para não cobrir a linha
const tooltipStyle = computed(() => {
  const t = hoverTime.value
  if (t === null) return {}
  return xScale(t) > width.value / 2 ? { left: `${PAD.left}px` } : { right: '0.5rem' }
})

function onMove(event: PointerEvent) {
  const times = allTimes.value
  const el = wrapperRef.value
  if (!el || times.length === 0) return
  const x = event.clientX - el.getBoundingClientRect().left
  let best = 0
  let bestDist = Infinity
  times.forEach((t, i) => {
    const d = Math.abs(xScale(t) - x)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  hoverIndex.value = best
}

function formatDay(t: number): string {
  return new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
}

function formatFullDay(t: number): string {
  return new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}
</script>
