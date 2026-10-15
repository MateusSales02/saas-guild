<template>
  <Teleport to="body">
    <!-- Notificações -->
    <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-ink-850/95 px-4 py-3 shadow-pop backdrop-blur"
          :class="TONE_BORDER[t.tone]"
          role="status"
        >
          <span class="mt-0.5" :class="TONE_ICON[t.tone].color">
            <AppIcon :name="TONE_ICON[t.tone].icon" :size="16" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-100">{{ t.title }}</p>
            <p v-if="t.text" class="mt-0.5 text-xs text-slate-400">{{ t.text }}</p>
          </div>
          <button type="button" class="text-slate-500 hover:text-slate-200" aria-label="Fechar" @click="dismissToast(t.id)">
            <AppIcon name="x" :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Confirmação -->
    <div
      v-if="confirmState.current"
      class="modal-backdrop"
      @mousedown.self="settleConfirm(false)"
      @keydown.esc="settleConfirm(false)"
    >
      <div class="modal-panel max-w-md p-6" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="flex gap-4">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
            :class="confirmState.current.danger ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-gold-500/30 bg-gold-500/10 text-gold-300'"
          >
            <AppIcon :name="confirmState.current.danger ? 'alert' : 'info'" :size="18" />
          </span>
          <div>
            <h2 id="confirm-title" class="text-base font-semibold text-slate-50">{{ confirmState.current.title }}</h2>
            <p v-if="confirmState.current.text" class="mt-1.5 text-sm text-slate-400">{{ confirmState.current.text }}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button ref="cancelRef" type="button" class="btn btn-ghost" @click="settleConfirm(false)">Cancelar</button>
          <button
            type="button"
            class="btn"
            :class="confirmState.current.danger ? 'btn-danger' : 'btn-primary'"
            @click="settleConfirm(true)"
          >
            {{ confirmState.current.confirmLabel ?? 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'
import { confirmState, dismissToast, settleConfirm, toasts, type ToastTone } from '@/lib/toast'

const TONE_BORDER: Record<ToastTone, string> = {
  success: 'border-emerald-500/25',
  error: 'border-rose-500/30',
  info: 'border-white/10',
}
const TONE_ICON: Record<ToastTone, { icon: IconName; color: string }> = {
  success: { icon: 'check', color: 'text-emerald-300' },
  error: { icon: 'alert', color: 'text-rose-300' },
  info: { icon: 'info', color: 'text-gold-300' },
}

// Foco no "Cancelar": a opção segura fica selecionada por padrão
const cancelRef = ref<HTMLButtonElement | null>(null)
watch(
  () => confirmState.current,
  (current) => {
    if (current) nextTick(() => cancelRef.value?.focus())
  },
)
</script>
