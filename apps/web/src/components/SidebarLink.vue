<template>
  <RouterLink v-slot="{ href, navigate, isActive, isExactActive }" :to="to" custom>
    <a
      :href="href"
      :aria-current="(exact ? isExactActive : isActive) ? 'page' : undefined"
      class="group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
      :class="(exact ? isExactActive : isActive)
        ? 'bg-gradient-to-r from-gold-500/[0.14] via-gold-500/[0.05] to-transparent text-gold-100'
        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'"
      @click="navigate"
    >
      <span
        v-if="exact ? isExactActive : isActive"
        class="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gold-400 shadow-[0_0_12px_rgba(198,169,93,0.8)]"
        aria-hidden="true"
      />
      <AppIcon
        :name="icon"
        :size="18"
        :class="(exact ? isExactActive : isActive) ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'"
      />
      <span class="truncate">{{ label }}</span>
      <span v-if="badge" class="ml-auto badge badge-gold">{{ badge }}</span>
    </a>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

withDefaults(
  defineProps<{
    icon: IconName
    label: string
    to: RouteLocationRaw
    /** Ativo só na rota exata (ex: a raiz do painel) */
    exact?: boolean
    badge?: string
  }>(),
  { exact: false, badge: '' },
)
</script>
