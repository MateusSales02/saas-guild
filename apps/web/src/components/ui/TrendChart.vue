<template>
  <div ref="wrapperRef" class="relative select-none" :style="{ height: `${height}px` }">
    <svg
      v-if="width > 0"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="block overflow-visible"
      role="img"
      :aria-label="ariaLabel"
      @pointermove="onMove"
      @pointerdown="onMove"
      @pointerleave="hover = null"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Grade -->
      <g v-for="tick in yTicks" :key="tick">
        <line :x1="PAD.left" :x2="width - PAD.right" :y1="y(tick)" :y2="y(tick)" stroke="rgba(255,255,255,0.05)" />
        <text :x="PAD.left - 8" :y="y(tick) + 3.5" text-anchor="end" font-size="10.5" fill="#64748b">{{ formatTick(tick) }}</text>
      </g>
      <text
        v-for="(p, i) in xLabels"
        :key="`x${i}`"
        :x="x(p.index)"
        :y="height - 6"
        text-anchor="middle"
        font-size="10.5"
        fill="#64748b"
      >{{ p.label }}</text>

      <!-- Barras -->
      <template v-if="type === 'bar'">
        <rect
          v-for="(p, i) in points"
          :key="i"
          :x="x(i) - barWidth / 2"
          :y="y(p.value)"
          :width="barWidth"
          :height="Math.max(0, y(minY) - y(p.value))"
          rx="3"
          :fill="hover === i ? color : `${color}99`"
        />
      </template>

      <!-- Área -->
      <template v-else-if="points.length">
        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path :d="linePath" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      </template>

      <!-- Hover -->
      <g v-if="hover !== null && points[hover]">
        <line
          :x1="x(hover)"
          :x2="x(hover)"
          :y1="PAD.top"
          :y2="height - PAD.bottom"
          stroke="rgba(255,255,255,0.12)"
          stroke-dasharray="3 3"
        />
        <circle v-if="type === 'area'" :cx="x(hover)" :cy="y(points[hover].value)" r="4.5" :fill="color" stroke="#0b0d12" stroke-width="2" />
      </g>
    </svg>

    <div
      v-if="hover !== null && points[hover]"
      class="pointer-events-none absolute z-10 rounded-lg border border-white/10 bg-ink-850/95 px-3 py-2 shadow-pop backdrop-blur"
      :style="tooltipStyle"
    >
      <p class="text-[11px] text-slate-500">{{ points[hover].label }}</p>
      <p class="text-sm font-semibold tabular-nums text-slate-50">{{ formatValue(points[hover].value) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface TrendPoint {
  label: string
  value: number
  /** Rótulo curto exibido no eixo X */
  short?: string
}

const props = withDefaults(
  defineProps<{
    points: TrendPoint[]
    type?: 'area' | 'bar'
    color?: string
    height?: number
    ariaLabel?: string
    formatValue?: (v: number) => string
  }>(),
  {
    type: 'area',
    color: '#C6A95D',
    height: 200,
    ariaLabel: 'Gráfico',
    formatValue: (v: number) => v.toLocaleString('pt-BR'),
  },
)

const PAD = { top: 12, right: 12, bottom: 24, left: 44 }
const gradientId = `trend-${Math.random().toString(36).slice(2, 9)}`

const wrapperRef = ref<HTMLElement | null>(null)
const width = ref(0)
const hover = ref<number | null>(null)

let observer: ResizeObserver | null = null
onMounted(() => {
  if (!wrapperRef.value) return
  width.value = wrapperRef.value.clientWidth
  observer = new ResizeObserver((entries) => (width.value = Math.floor(entries[0].contentRect.width)))
  observer.observe(wrapperRef.value)
})
onBeforeUnmount(() => observer?.disconnect())

const values = computed(() => props.points.map((p) => p.value))
// Barras partem do zero; áreas usam a faixa dos valores para a curva não ficar achatada
const minY = computed(() => {
  if (props.type === 'bar' || !values.value.length) return 0
  const min = Math.min(...values.value)
  const max = Math.max(...values.value)
  const pad = (max - min) * 0.25 || Math.abs(min) * 0.1
  return min >= 0 ? Math.max(0, min - pad) : min - pad
})
const maxY = computed(() => {
  const max = Math.max(...values.value, 0)
  if (max <= minY.value) return minY.value + 1
  return max + (max - minY.value) * 0.12
})

function x(i: number): number {
  const n = props.points.length
  const inner = width.value - PAD.left - PAD.right
  if (props.type === 'bar') return PAD.left + (inner / n) * (i + 0.5)
  return PAD.left + (n <= 1 ? inner / 2 : (inner / (n - 1)) * i)
}

function y(v: number): number {
  const inner = props.height - PAD.top - PAD.bottom
  return PAD.top + inner - ((v - minY.value) / (maxY.value - minY.value)) * inner
}

const barWidth = computed(() => {
  const n = Math.max(1, props.points.length)
  return Math.max(3, Math.min(28, ((width.value - PAD.left - PAD.right) / n) * 0.6))
})

const linePath = computed(() =>
  props.points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' '),
)
const areaPath = computed(() => {
  if (!props.points.length) return ''
  const base = y(minY.value)
  return `${linePath.value} L${x(props.points.length - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`
})

const yTicks = computed(() => {
  const range = maxY.value - minY.value
  const raw = range / 3
  const exp = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const f = raw / exp
  let step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp
  // Contagens (barras) não têm frações
  if (props.type === 'bar') step = Math.max(1, Math.round(step))
  const ticks: number[] = []
  for (let v = Math.ceil(minY.value / step) * step; v <= maxY.value; v += step) ticks.push(Math.round(v * 100) / 100)
  return ticks
})

const xLabels = computed(() => {
  const n = props.points.length
  if (!n) return []
  const max = Math.max(2, Math.floor((width.value - PAD.left - PAD.right) / 64))
  const step = Math.ceil(n / max)
  return props.points
    .map((p, index) => ({ index, label: p.short ?? p.label }))
    .filter((p) => p.index % step === 0)
})

function formatTick(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (abs >= 1_000) return `${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

function onMove(event: PointerEvent) {
  const el = wrapperRef.value
  if (!el || !props.points.length) return
  const px = event.clientX - el.getBoundingClientRect().left
  let best = 0
  let dist = Infinity
  props.points.forEach((_, i) => {
    const d = Math.abs(x(i) - px)
    if (d < dist) {
      dist = d
      best = i
    }
  })
  hover.value = best
}

// Tooltip acima do ponto, sem sair do container
const tooltipStyle = computed(() => {
  if (hover.value === null) return {}
  const px = x(hover.value)
  const alignRight = px > width.value * 0.65
  return {
    top: '0px',
    ...(alignRight ? { right: `${width.value - px + 10}px` } : { left: `${px + 10}px` }),
  }
})
</script>
