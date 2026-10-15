<template>
  <div class="grid w-fit grid-cols-3 gap-2" role="list" aria-label="Equipamento">
    <div
      v-for="cell in cells"
      :key="cell.key"
      :role="cell.key === 'bag' ? undefined : 'listitem'"
      :aria-hidden="cell.key === 'bag' ? 'true' : undefined"
      class="relative flex items-center justify-center rounded-xl border"
      :class="[
        cell.id ? 'border-white/[0.08] bg-white/[0.03]' : 'border-dashed border-white/[0.07]',
        { invisible: cell.key === 'bag' },
      ]"
      :style="{ width: `${size}px`, height: `${size}px` }"
      :title="cell.id ? `${cell.label}: ${data?.items[cell.id]?.n ?? cell.id}` : `${cell.label}: vazio`"
    >
      <ItemIcon
        v-if="cell.id"
        :item-id="cell.id"
        :size="size - 6"
        :alt="data?.items[cell.id]?.n ?? ''"
        :class="{ 'opacity-30 grayscale': cell.ghost }"
      />
      <span v-else class="px-1 text-center text-[10px] leading-tight text-slate-600">{{ cell.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import type { BuildData, Loadout } from '@/lib/builds'

const props = withDefaults(defineProps<{ loadout: Loadout; data: BuildData | null; size?: number }>(), { size: 72 })

/** Mesma disposição da tela de personagem do jogo */
const cells = computed(() => {
  const eq = props.loadout.equipment
  const cons = props.loadout.consumables
  const weapon = eq.weapon.rec
  const twoHanded = !!(weapon && props.data?.items[weapon]?.h)
  return [
    // Espaço da bolsa no jogo: mantido vazio só para preservar a disposição
    { key: 'bag', label: '', id: null as string | null, ghost: false },
    { key: 'head', label: 'Cabeça', id: eq.head.rec, ghost: false },
    { key: 'cape', label: 'Capa', id: eq.cape.rec, ghost: false },
    { key: 'weapon', label: 'Arma', id: weapon, ghost: false },
    { key: 'armor', label: 'Peitoral', id: eq.armor.rec, ghost: false },
    // Arma de duas mãos ocupa também a mão secundária (aparece apagada, como no jogo)
    { key: 'offhand', label: 'Mão secundária', id: twoHanded ? weapon : eq.offhand.rec, ghost: twoHanded },
    { key: 'potion', label: 'Poção', id: cons.potion.rec, ghost: false },
    { key: 'shoes', label: 'Botas', id: eq.shoes.rec, ghost: false },
    { key: 'food', label: 'Comida', id: cons.food.rec, ghost: false },
  ]
})
</script>
