<template>
  <div class="group/spell relative">
    <button
      type="button"
      class="relative block rounded-xl border border-white/[0.08] bg-white/[0.03] outline-none transition-colors hover:border-gold-500/40 focus-visible:border-gold-500/60"
      :class="{ 'opacity-60': muted }"
      :aria-label="spell ? `${spell.n}${hotkey ? ` (${hotkey})` : ''}` : spellId"
      :aria-describedby="tooltipId"
    >
      <ItemIcon :item-id="spellId" kind="spell" :size="size" :alt="spell?.n ?? ''" />
      <span
        v-if="hotkey"
        class="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-ink-950 px-1 text-[10px] font-semibold text-gold-200"
        aria-hidden="true"
      >
        {{ hotkey }}
      </span>
    </button>

    <div
      :id="tooltipId"
      role="tooltip"
      class="pointer-events-none invisible absolute bottom-full left-1/2 z-40 mb-2 w-72 -translate-x-1/2 rounded-xl border border-white/[0.1] bg-ink-850 p-3 text-left opacity-0 shadow-pop transition-opacity duration-150 group-hover/spell:visible group-hover/spell:opacity-100 group-focus-within/spell:visible group-focus-within/spell:opacity-100"
    >
      <p class="text-sm font-semibold text-slate-50">{{ spell?.n ?? spellId }}</p>
      <p v-if="spell?.cd || spell?.en" class="mt-1 flex gap-3 text-[11px] text-slate-400">
        <span v-if="spell?.cd" class="inline-flex items-center gap-1"><AppIcon name="clock" :size="11" /> {{ spell.cd }}s de recarga</span>
        <span v-if="spell?.en">{{ spell.en }} de energia</span>
      </p>
      <p v-if="spell?.d" class="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-300">{{ spell.d }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { GameSpell } from '@/lib/builds'

withDefaults(defineProps<{ spellId: string; spell?: GameSpell; hotkey?: string; size?: number; muted?: boolean }>(), {
  spell: undefined,
  hotkey: undefined,
  size: 44,
  muted: false,
})

const tooltipId = `spell-tip-${useId()}`
</script>
