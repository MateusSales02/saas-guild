<template>
  <section class="panel">
    <h2>
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        :class="{ 'border-b border-white/[0.06]': open }"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="open = !open"
      >
        <span>
          <span class="section-title block">{{ title }}</span>
          <span v-if="subtitle" class="panel-subtitle block">{{ subtitle }}</span>
        </span>
        <AppIcon name="chevron-down" :size="18" class="shrink-0 text-slate-400 transition-transform" :class="{ 'rotate-180': open }" />
      </button>
    </h2>
    <div v-show="open" :id="bodyId" class="p-5">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(defineProps<{ title: string; subtitle?: string }>(), { subtitle: undefined })

const open = ref(true)
const bodyId = `collapse-${useId()}`
</script>
