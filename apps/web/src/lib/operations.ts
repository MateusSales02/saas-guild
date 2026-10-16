import type { EntryKind, OperationCategory, OperationStatus } from '@/lib/api'

export const CATEGORY_LABELS: Record<OperationCategory, string> = {
  flip: 'Revenda (flip)',
  craft: 'Craft',
  refine: 'Refino',
  transport: 'Transporte',
  gathering: 'Coleta',
  other: 'Outro',
}

export const STATUS_LABELS: Record<OperationStatus, string> = {
  open: 'Em aberto',
  sold: 'Vendida',
  cancelled: 'Perdida',
}

export const ENTRY_LABELS: Record<EntryKind, string> = {
  purchase: 'Compra',
  fee: 'Gasto extra',
  sale: 'Venda',
}

/** Fração vendida (0–1) quando a operação controla quantidade */
export function soldProgress(op: { quantity: number; sold_quantity: number }) {
  return op.quantity > 0 ? Math.min(1, op.sold_quantity / op.quantity) : 0
}

export const STATUS_BADGE: Record<OperationStatus, string> = {
  open: 'badge-info',
  sold: 'badge-success',
  cancelled: 'badge-danger',
}

/** Taxa padrão do mercado: 4% de imposto (premium) + 2,5% de setup */
export const DEFAULT_FEE_RATE = 6.5

/** Taxa do mercado sobre um valor bruto; mesmo arredondamento da API */
export function marketTax(gross: number, rate: number | null | undefined) {
  return Math.round((gross * (Number(rate) || 0)) / 100)
}

/** Prévia do formulário: o mesmo cálculo que a API faz */
export function previewProfit(input: {
  cost?: number | null
  feeRate?: number | null
  revenue?: number | null
}) {
  const totalCost = Math.max(0, Number(input.cost) || 0)
  const revenue = Math.max(0, Number(input.revenue) || 0)
  const tax = marketTax(revenue, Math.max(0, Number(input.feeRate) || 0))
  const profit = revenue - tax - totalCost
  return { totalCost, revenue, tax, profit, margin: totalCost > 0 ? profit / totalCost : null }
}

export function toSilver(n: number) {
  return `${new Intl.NumberFormat('pt-BR').format(Math.round(n))}g`
}

export function signedSilver(n: number) {
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${toSilver(Math.abs(n))}`
}

/** 1 234 567 → "1,2M"; usado em eixos e chips */
export function compactSilver(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: v < 10 ? 1 : 0 }).format(v)
  if (abs >= 1e9) return `${sign}${fmt(abs / 1e9)}B`
  if (abs >= 1e6) return `${sign}${fmt(abs / 1e6)}M`
  if (abs >= 1e3) return `${sign}${fmt(abs / 1e3)}k`
  return `${sign}${Math.round(abs)}`
}

export function percent(ratio: number | null, digits = 0) {
  if (ratio === null || !Number.isFinite(ratio)) return '—'
  return `${(ratio * 100).toFixed(digits).replace('.', ',')}%`
}

export function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

/** Data local YYYY-MM-DD para <input type="date"> */
export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Converte o valor do <input type="date"> em ISO ao meio-dia local (evita virar o dia por fuso) */
export function dayToIso(day: string) {
  return new Date(`${day}T12:00:00`).toISOString()
}
