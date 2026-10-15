<template>
  <div class="empty-state">
    <div class="empty-icon">
      <AppIcon :name="icon" :size="22" />
    </div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="text" class="empty-text">{{ text }}</p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

withDefaults(defineProps<{ icon?: IconName; title: string; text?: string }>(), { icon: 'sparkles', text: '' })
</script>
