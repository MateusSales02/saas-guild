import { reactive } from 'vue'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  tone: ToastTone
  title: string
  text?: string
}

let nextId = 1

export const toasts = reactive<Toast[]>([])

/** Notificação discreta no canto da tela; some sozinha */
export function toast(title: string, options: { tone?: ToastTone; text?: string; duration?: number } = {}) {
  const item: Toast = { id: nextId++, tone: options.tone ?? 'success', title, text: options.text }
  toasts.push(item)
  setTimeout(() => dismissToast(item.id), options.duration ?? 3500)
}

export function dismissToast(id: number) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index >= 0) toasts.splice(index, 1)
}

// ---------- Confirmação ----------

export interface ConfirmRequest {
  title: string
  text?: string
  confirmLabel?: string
  danger?: boolean
  resolve: (ok: boolean) => void
}

export const confirmState = reactive<{ current: ConfirmRequest | null }>({ current: null })

/** Pede confirmação antes de ações destrutivas. Resolve true se o usuário confirmar. */
export function confirmAction(options: Omit<ConfirmRequest, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    confirmState.current?.resolve(false)
    confirmState.current = { ...options, resolve }
  })
}

export function settleConfirm(ok: boolean) {
  const current = confirmState.current
  confirmState.current = null
  current?.resolve(ok)
}
