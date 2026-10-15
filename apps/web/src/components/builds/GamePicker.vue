<template>
  <div ref="root" class="flex items-center gap-3">
    <span
      v-if="selected && showIcon"
      class="inset flex h-14 w-14 shrink-0 items-center justify-center"
    >
      <ItemIcon :item-id="selected.id" :kind="kind" :size="50" :alt="selected.name" />
    </span>

    <div class="relative min-w-0 flex-1">
      <input
        :id="inputId"
        ref="input"
        :value="open ? query : (selected?.name ?? '')"
        type="text"
        role="combobox"
        autocomplete="off"
        class="input"
        :class="{ '!pr-9': selected && !disabled, 'cursor-pointer': !open }"
        :placeholder="open && selected ? selected.name : placeholder"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="open && filtered[active] ? `${listId}-${active}` : undefined"
        :aria-label="label"
        @focus="openList"
        @click="openList"
        @input="onInput"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="pick(filtered[active])"
        @keydown.esc="close"
        @keydown.tab="close"
      />
      <button
        v-if="selected && !disabled"
        type="button"
        class="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
        :aria-label="`Remover ${selected.name}`"
        @click="clear"
      >
        <AppIcon name="x" :size="15" />
      </button>

      <ul
        v-if="open"
        :id="listId"
        ref="list"
        role="listbox"
        class="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-white/[0.1] bg-ink-850 py-1 shadow-pop"
      >
        <li v-if="!filtered.length" class="px-3 py-4 text-center text-sm text-slate-500">Nada encontrado</li>
        <template v-for="(option, i) in filtered" :key="option.id">
          <li
            v-if="grouped && option.group && option.group !== filtered[i - 1]?.group"
            role="presentation"
            class="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-eyebrow text-gold-500/80"
          >
            {{ option.group }}
          </li>
          <li
            :id="`${listId}-${i}`"
            role="option"
            :aria-selected="option.id === modelValue"
            class="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm text-slate-200"
            :class="{
              'bg-white/[0.06]': i === active,
              '!text-gold-200': option.id === modelValue,
            }"
            @mousedown.prevent="pick(option)"
            @mousemove="active = i"
          >
            <ItemIcon :item-id="option.id" :kind="kind" :size="32" />
            <span class="min-w-0 flex-1 truncate">{{ option.name }}</span>
            <AppIcon v-if="option.id === modelValue" name="check" :size="14" class="shrink-0" />
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { PickerOption } from '@/lib/builds'
import { normalizeText } from '@/lib/market'

const props = withDefaults(
  defineProps<{
    modelValue: string | null
    options: PickerOption[]
    placeholder?: string
    label?: string
    kind?: 'item' | 'spell'
    disabled?: boolean
    grouped?: boolean
    showIcon?: boolean
    inputId?: string
  }>(),
  { placeholder: 'Selecione', label: undefined, kind: 'item', disabled: false, grouped: false, showIcon: true, inputId: undefined },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const listId = `picker-${useId()}`
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const open = ref(false)
const query = ref('')
const active = ref(0)

const selected = computed(() => props.options.find((o) => o.id === props.modelValue) ?? null)

const filtered = computed(() => {
  const q = normalizeText(query.value)
  if (!q) return props.options
  return props.options.filter((o) => normalizeText(`${o.name} ${o.group ?? ''}`).includes(q))
})

function openList() {
  if (props.disabled || open.value) return
  open.value = true
  query.value = ''
  const current = filtered.value.findIndex((o) => o.id === props.modelValue)
  active.value = Math.max(0, current)
  nextTick(scrollToActive)
}

function close() {
  open.value = false
  query.value = ''
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  active.value = 0
  open.value = true
}

function move(step: number) {
  if (!open.value) return openList()
  const total = filtered.value.length
  if (!total) return
  active.value = (active.value + step + total) % total
  nextTick(scrollToActive)
}

function scrollToActive() {
  list.value?.querySelector(`#${CSS.escape(`${listId}-${active.value}`)}`)?.scrollIntoView({ block: 'nearest' })
}

function pick(option?: PickerOption) {
  if (!option) return
  emit('update:modelValue', option.id)
  close()
  input.value?.blur()
}

function clear() {
  emit('update:modelValue', null)
  close()
}

function onDocumentPointer(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', onDocumentPointer))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocumentPointer))
</script>
