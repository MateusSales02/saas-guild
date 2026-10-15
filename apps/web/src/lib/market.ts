import itemsData from '@/data/market-items.json'
import type { AlbionHistoryData, AlbionPriceData, AlbionRegion } from '@/lib/api'

// ==================== CONSTANTES ====================

export const MARKET_CITIES = [
  'Caerleon',
  'Bridgewatch',
  'Lymhurst',
  'Fort Sterling',
  'Thetford',
  'Martlock',
  'Brecilien',
  'Black Market',
] as const

export type MarketCity = (typeof MARKET_CITIES)[number]

export const CITY_COLORS: Record<MarketCity, string> = {
  Caerleon: '#ef4444',
  Bridgewatch: '#f97316',
  Lymhurst: '#22c55e',
  'Fort Sterling': '#e2e8f0',
  Thetford: '#a855f7',
  Martlock: '#3b82f6',
  Brecilien: '#14b8a6',
  'Black Market': '#C6A95D',
}

export const REGIONS: Array<{ value: AlbionRegion; label: string }> = [
  { value: 'west', label: 'Américas' },
  { value: 'europe', label: 'Europa' },
  { value: 'east', label: 'Ásia' },
]

export const QUALITIES = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Bom' },
  { value: 3, label: 'Excepcional' },
  { value: 4, label: 'Excelente' },
  { value: 5, label: 'Obra-prima' },
]

export const TIERS = [1, 2, 3, 4, 5, 6, 7, 8]

export const ITEM_GROUPS = [
  'Armas',
  'Mão Secundária',
  'Armaduras',
  'Acessórios',
  'Artefatos',
  'Recursos',
  'Consumíveis',
  'Montarias',
  'Coleta',
] as const

export type ItemGroup = (typeof ITEM_GROUPS)[number]

/** Taxa de venda: 4% com premium, 8% sem premium */
export const SALES_TAX = { premium: 0.04, standard: 0.08 }

// ==================== CATÁLOGO ====================

/**
 * Item do mercado agrupado por ID base (sem o prefixo de tier).
 * Gerado a partir dos dumps oficiais por scripts/generate-market-items.mjs.
 */
export interface CatalogItem {
  baseId: string
  name: string
  category: string
  group: ItemGroup
  tiers: number[]
  /** Nomes por tier quando variam além do sufixo (ex: recursos) */
  tierNames?: Record<number, string>
  maxEnchant: number
  /** Recursos encantados usam o formato _LEVELn@n */
  leveled: boolean
  /** Possui níveis de qualidade (equipamentos e montarias) */
  hasQuality: boolean
}

export interface MarketItemEntry {
  id: string
  name: string
  group: string
  category: string
  tiers: number[]
  tierNames?: Record<string, string>
  maxEnchant?: number
  leveled?: boolean
  quality?: boolean
}

export function buildCatalog(entries: MarketItemEntry[]): CatalogItem[] {
  return entries
    .filter((e) => (ITEM_GROUPS as readonly string[]).includes(e.group))
    .map((e) => ({
      baseId: e.id,
      name: e.name,
      category: e.category,
      group: e.group as ItemGroup,
      tiers: [...e.tiers].sort((a, b) => a - b),
      tierNames: e.tierNames
        ? Object.fromEntries(Object.entries(e.tierNames).map(([t, n]) => [Number(t), n]))
        : undefined,
      maxEnchant: e.maxEnchant ?? 0,
      leveled: !!e.leveled,
      hasQuality: !!e.quality,
    }))
}

export const CATALOG: CatalogItem[] = buildCatalog(itemsData as MarketItemEntry[])

const CATALOG_BY_ID = new Map(CATALOG.map((i) => [i.baseId, i]))

export function findCatalogItem(baseId: string): CatalogItem | undefined {
  return CATALOG_BY_ID.get(baseId)
}

/** Nome do item no tier informado (recursos e consumíveis mudam de nome por tier) */
export function itemName(item: CatalogItem, tier?: number): string {
  return (tier !== undefined && item.tierNames?.[tier]) || item.name
}

// ==================== IDS ====================

export function buildItemId(baseId: string, tier: number, enchantment = 0): string {
  const base = `T${tier}_${baseId}`
  const item = findCatalogItem(baseId)
  const max = item ? item.maxEnchant : 4
  const level = Math.min(enchantment, max)
  if (level <= 0) return base
  if (item?.leveled) return `${base}_LEVEL${level}@${level}`
  return `${base}@${level}`
}

export interface ParsedItemId {
  baseId: string
  tier: number
  enchantment: number
}

export function parseItemId(itemId: string): ParsedItemId | null {
  const match = /^T(\d)_(.+?)(?:_LEVEL\d)?(?:@(\d))?$/.exec(itemId.trim().toUpperCase())
  if (!match) return null
  return {
    tier: Number(match[1]),
    baseId: match[2],
    enchantment: match[3] ? Number(match[3]) : 0,
  }
}

/**
 * O servidor de ícones desenha cada combinação de parâmetros sob demanda: tamanhos
 * comuns (64 e 128) já estão em cache e chegam em < 1s, mas um tamanho "quebrado"
 * (ex: 88, 144) pode levar de 10 a 60s. Por isso arredondamos sempre para 64 ou 128.
 */
export function iconRenderSize(size: number): 64 | 128 {
  return size <= 64 ? 64 : 128
}

export function getItemIconUrl(itemId: string, quality = 1, size = 64): string {
  const base = `https://render.albiononline.com/v1/item/${encodeURIComponent(itemId)}.png?size=${iconRenderSize(size)}`
  // Qualidade 1 é o padrão do servidor: omitir o parâmetro reaproveita a URL em cache
  return quality > 1 ? `${base}&quality=${quality}` : base
}

export function getSpellIconUrl(spellId: string, size = 64): string {
  return `https://render.albiononline.com/v1/spell/${encodeURIComponent(spellId)}.png?size=${iconRenderSize(size)}`
}

// ==================== BUSCA ====================

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export interface SearchQuery {
  text: string
  tier?: number
  enchantment?: number
}

/**
 * Interpreta buscas como "espada t6", "6.2 bolsa" ou "T5_BAG@1".
 */
export function parseSearchQuery(query: string): SearchQuery {
  const parsedId = parseItemId(query)
  if (parsedId && /_/.test(query)) {
    return { text: parsedId.baseId, tier: parsedId.tier, enchantment: parsedId.enchantment }
  }

  let tier: number | undefined
  let enchantment: number | undefined
  const text = query.replace(/\b[tT]?([4-8])(?:\.([0-4]))?\b/, (_m, t: string, e?: string) => {
    tier = Number(t)
    if (e !== undefined) enchantment = Number(e)
    return ''
  })

  return { text: text.replace(/\s+/g, ' ').trim(), tier, enchantment }
}

export function searchCatalog(query: string, limit = 8, catalog: CatalogItem[] = CATALOG): CatalogItem[] {
  const { text, tier } = parseSearchQuery(query)
  const needle = normalizeText(text)
  if (!needle) return []

  const scored: Array<{ item: CatalogItem; score: number }> = []
  for (const item of catalog) {
    if (tier && !item.tiers.includes(tier)) continue
    const names = [item.name, ...Object.values(item.tierNames ?? {})].map(normalizeText)
    const id = item.baseId.toLowerCase()
    const category = normalizeText(item.category)

    let score = 0
    if (names.includes(needle) || id === needle) score = 100
    else if (names.some((n) => n.startsWith(needle))) score = 80
    else if (names.some((n) => n.split(' ').some((w) => w.startsWith(needle)))) score = 60
    else if (names.some((n) => n.includes(needle))) score = 50
    else if (id.includes(needle.replace(/\s+/g, '_'))) score = 40
    else if (category.includes(needle)) score = 20

    if (score > 0) scored.push({ item, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map((s) => s.item)
}

// ==================== PREÇOS ====================

const EMPTY_DATE_PREFIX = '0001-01-01'

export function hasDate(date?: string): boolean {
  return !!date && !date.startsWith(EMPTY_DATE_PREFIX)
}

export type Freshness = 'fresh' | 'recent' | 'stale' | 'none'

export function getFreshness(date: string | undefined, now = Date.now()): Freshness {
  if (!hasDate(date)) return 'none'
  // A API retorna datas UTC sem o sufixo "Z"
  const iso = /Z|[+-]\d\d:?\d\d$/.test(date!) ? date! : `${date}Z`
  const hours = (now - new Date(iso).getTime()) / 3_600_000
  if (hours < 2) return 'fresh'
  if (hours < 24) return 'recent'
  return 'stale'
}

export function formatAge(date: string | undefined, now = Date.now()): string {
  if (!hasDate(date)) return '—'
  const iso = /Z|[+-]\d\d:?\d\d$/.test(date!) ? date! : `${date}Z`
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000))
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function formatSilver(value: number | null | undefined): string {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR').format(Math.round(value))
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}k`
  return String(Math.round(value))
}

export interface CityPriceRow {
  city: MarketCity
  sellMin: number
  sellMax: number
  buyMax: number
  sellDate: string
  buyDate: string
  avg30d: number
  volume30d: number
}

export function buildCityRows(
  prices: AlbionPriceData[],
  history: AlbionHistoryData[] = [],
): CityPriceRow[] {
  const rows: CityPriceRow[] = []

  for (const city of MARKET_CITIES) {
    const price = prices.find((p) => p.city === city)
    const hist = history.find((h) => h.location === city)
    const { avg, volume } = summarizeHistory(hist)

    if (!price && !hist) continue

    rows.push({
      city,
      sellMin: price?.sell_price_min ?? 0,
      sellMax: price?.sell_price_max ?? 0,
      buyMax: price?.buy_price_max ?? 0,
      sellDate: price?.sell_price_min_date ?? '',
      buyDate: price?.buy_price_max_date ?? '',
      avg30d: avg,
      volume30d: volume,
    })
  }

  return rows
}

export function summarizeHistory(hist?: AlbionHistoryData): { avg: number; volume: number } {
  if (!hist || hist.data.length === 0) return { avg: 0, volume: 0 }
  let total = 0
  let volume = 0
  for (const point of hist.data) {
    total += point.avg_price * point.item_count
    volume += point.item_count
  }
  return { avg: volume > 0 ? total / volume : 0, volume }
}

export interface MarketSummary {
  bestSell: CityPriceRow | null
  bestBuy: CityPriceRow | null
  avg30d: number
  volume30d: number
  flip: { from: MarketCity; to: MarketCity; profit: number; margin: number } | null
}

/**
 * Melhor venda = ordem de venda mais barata (onde comprar).
 * Melhor compra = ordem de compra mais alta (onde vender instantaneamente).
 * Flip = comprar na melhor venda e vender na melhor ordem de compra, descontando a taxa.
 */
export function summarizeMarket(rows: CityPriceRow[], premium = true): MarketSummary {
  const sellable = rows.filter((r) => r.sellMin > 0 && r.city !== 'Black Market')
  const buyable = rows.filter((r) => r.buyMax > 0)

  const bestSell = sellable.reduce<CityPriceRow | null>(
    (best, r) => (!best || r.sellMin < best.sellMin ? r : best),
    null,
  )
  const bestBuy = buyable.reduce<CityPriceRow | null>(
    (best, r) => (!best || r.buyMax > best.buyMax ? r : best),
    null,
  )

  const volume30d = rows.reduce((sum, r) => sum + r.volume30d, 0)
  const avg30d =
    volume30d > 0 ? rows.reduce((sum, r) => sum + r.avg30d * r.volume30d, 0) / volume30d : 0

  let flip: MarketSummary['flip'] = null
  if (bestSell && bestBuy && bestSell.city !== bestBuy.city) {
    const tax = premium ? SALES_TAX.premium : SALES_TAX.standard
    const profit = bestBuy.buyMax * (1 - tax) - bestSell.sellMin
    flip = {
      from: bestSell.city,
      to: bestBuy.city,
      profit,
      margin: profit / bestSell.sellMin,
    }
  }

  return { bestSell, bestBuy, avg30d, volume30d, flip }
}

// ==================== HISTÓRICO (GRÁFICO) ====================

export interface ChartSeries {
  city: MarketCity
  color: string
  points: Array<{ t: number; v: number; count: number }>
}

export function buildChartSeries(history: AlbionHistoryData[]): ChartSeries[] {
  const series: ChartSeries[] = []
  for (const city of MARKET_CITIES) {
    const hist = history.find((h) => h.location === city)
    if (!hist || hist.data.length === 0) continue
    series.push({
      city,
      color: CITY_COLORS[city],
      points: hist.data
        .map((d) => ({
          t: new Date(/Z$/.test(d.timestamp) ? d.timestamp : `${d.timestamp}Z`).getTime(),
          v: d.avg_price,
          count: d.item_count,
        }))
        .filter((p) => p.v > 0 && !Number.isNaN(p.t))
        .sort((a, b) => a.t - b.t),
    })
  }
  return series.filter((s) => s.points.length > 0)
}

/** Data no formato MM-DD-YYYY exigido pela API de histórico */
export function formatApiDate(date: Date): string {
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${mm}-${dd}-${date.getUTCFullYear()}`
}
