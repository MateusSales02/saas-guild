<template>
  <RouterLink :to="to" class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/70">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="w-5 h-5 opacity-80"
      fill="none"
      stroke="currentColor"
    >
      <template v-if="icon === 'users'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16.87 3.13a4 4 0 0 1 0 7.75" />
      </template>
      <template v-else-if="icon === 'swords'">
        <path d="m14.5 17.5 2 2 5-5-2-2-5 5z" />
        <path d="M18 13 7 2H2v5l11 11" />
        <path d="M2 2l7 7" />
      </template>
      <template v-else-if="icon === 'calendar'">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </template>
      <template v-else-if="icon === 'treasure'">
        <path d="M2 7h20v10H2z" />
        <path d="M6 7V5h12v2" />
        <path d="M7 12h10M9 15h6" />
      </template>
      <template v-else-if="icon === 'hammer'">
        <path d="M2 21h4l9-9-4-4-9 9v4z" />
        <path d="m14.5 5.5 2-2 3 3-2 2z" />
      </template>
      <template v-else>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .64.37 1.22.95 1.49.37.17.77.26 1.18.26a2 2 0 1 1 0 4h-.09c-.66 0-1.26.26-1.7.7-.44.44-.7 1.04-.7 1.7z"
        />
      </template>
    </svg>
    <span class="text-sm">{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
type IconName = 'users' | 'swords' | 'calendar' | 'treasure' | 'settings' | 'hammer'
defineProps<{ icon: IconName; label: string; to: RouteLocationRaw }>()
</script>
