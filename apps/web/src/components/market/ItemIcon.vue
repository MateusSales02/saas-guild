<template>
  <span class="relative inline-flex shrink-0 items-center justify-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <span
      v-if="status !== 'loaded'"
      class="absolute inset-1 rounded-lg border border-slate-700/50 bg-slate-800/60"
      :class="{ 'animate-pulse': status === 'loading' }"
    >
      <svg
        v-if="status === 'error'"
        class="absolute inset-0 m-auto h-1/2 w-1/2 text-slate-600"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
      </svg>
    </span>
    <img
      v-if="status !== 'error'"
      :key="src"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="relative h-full w-full object-contain transition-opacity duration-200"
      :class="status === 'loaded' ? 'opacity-100' : 'opacity-0'"
      ref="img"
      @load="onLoad"
      @error="onError"
    />
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getItemIconUrl, getSpellIconUrl } from '@/lib/market'

const props = withDefaults(
  defineProps<{ itemId: string; quality?: number; size?: number; alt?: string; eager?: boolean; kind?: 'item' | 'spell' }>(),
  { quality: 1, size: 40, alt: '', eager: false, kind: 'item' },
)

// Se a imagem falhar (o servidor às vezes demora demais), tenta de novo uma vez
// pela URL sem parâmetros, que é a mais requisitada e quase sempre está em cache
const retried = ref(false)

// Pede a imagem em 2x para ficar nítida em telas de alta densidade
const src = computed(() => {
  if (retried.value) {
    const kind = props.kind === 'spell' ? 'spell' : 'item'
    return `https://render.albiononline.com/v1/${kind}/${encodeURIComponent(props.itemId)}.png`
  }
  const size = props.size * 2
  return props.kind === 'spell' ? getSpellIconUrl(props.itemId, size) : getItemIconUrl(props.itemId, props.quality, size)
})

const status = ref<'loading' | 'loaded' | 'error'>('loading')

// Imagem que ainda não chegou depois de alguns segundos também vai para a URL alternativa
const SLOW_MS = 5000
let slowTimer: ReturnType<typeof setTimeout> | undefined
const img = ref<HTMLImageElement | null>(null)

function armSlowTimer() {
  clearTimeout(slowTimer)
  if (retried.value || props.quality > 1) return
  slowTimer = setTimeout(() => {
    if (status.value === 'loading' && img.value?.complete === false && isVisible()) retried.value = true
  }, SLOW_MS)
}

/** Ícones fora da tela (loading="lazy") ainda nem começaram a baixar: não são lentos */
function isVisible() {
  const rect = img.value?.getBoundingClientRect()
  return !!rect && rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0
}

watch(
  () => [props.itemId, props.kind, props.quality, props.size],
  () => {
    retried.value = false
    status.value = 'loading'
    armSlowTimer()
  },
)

onMounted(armSlowTimer)
onBeforeUnmount(() => clearTimeout(slowTimer))

function onLoad() {
  clearTimeout(slowTimer)
  status.value = 'loaded'
}

function onError() {
  clearTimeout(slowTimer)
  if (!retried.value && props.quality <= 1) {
    retried.value = true
    return
  }
  status.value = 'error'
}
</script>
