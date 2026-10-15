<template>
  <div class="grid gap-x-6 gap-y-2 md:grid-cols-2">
    <div>
      <label :for="recId" class="label">
        <span v-if="hotkey" class="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-ink-950 px-1 text-[10px] font-semibold text-gold-200">{{ hotkey }}</span>
        {{ label }}
      </label>
      <GamePicker
        :model-value="rec"
        :input-id="recId"
        :options="options"
        :kind="kind"
        :grouped="grouped"
        :disabled="disabled"
        :placeholder="disabled && disabledText ? disabledText : placeholder"
        @update:model-value="onRec"
      />
    </div>
    <div v-if="rec && !disabled">
      <label :for="altId" class="label !text-slate-500">
        <span class="md:hidden">Alternativa · </span>{{ label }}
      </label>
      <GamePicker
        :model-value="alt"
        :input-id="altId"
        :options="altOptions"
        :kind="kind"
        :grouped="grouped"
        placeholder="Opcional"
        @update:model-value="emit('update:alt', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import GamePicker from '@/components/builds/GamePicker.vue'
import type { PickerOption } from '@/lib/builds'

const props = withDefaults(
  defineProps<{
    label: string
    rec: string | null
    alt: string | null
    options: PickerOption[]
    kind?: 'item' | 'spell'
    placeholder?: string
    disabled?: boolean
    disabledText?: string
    grouped?: boolean
    hotkey?: string
  }>(),
  { kind: 'item', placeholder: 'Selecione', disabled: false, disabledText: undefined, grouped: false, hotkey: undefined },
)

const emit = defineEmits<{ 'update:rec': [value: string | null]; 'update:alt': [value: string | null] }>()

const uid = useId()
const recId = `choice-rec-${uid}`
const altId = `choice-alt-${uid}`

// A alternativa não pode repetir a escolha recomendada
const altOptions = computed(() => props.options.filter((o) => o.id !== props.rec))

function onRec(value: string | null) {
  emit('update:rec', value)
  if (!value || value === props.alt) emit('update:alt', null)
}
</script>
