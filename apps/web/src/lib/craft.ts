import type { AlbionPriceData } from '@/lib/api'
import {
  CATALOG,
  findCatalogItem,
  hasDate,
  itemName,
  parseItemId,
  SALES_TAX,
  type CatalogItem,
} from '@/lib/market'

// ==================== RECEITAS ====================

type RecipeTuple = [number, number, number, Array<[string, number, number]>]

export interface RecipeIngredient {
  id: string
  count: number
  /** Recursos devolvidos pela taxa de retorno (artefatos, por exemplo, não retornam) */
  returns: boolean
}

export interface Recipe {
  productId: string
  /** Unidades produzidas por craft (poções e comidas produzem várias) */
  amount: number
  /** Valor do item no jogo, base da taxa da estação */
  itemValue: number
  /** Prata cobrada por craft além da taxa da estação */
  silver: number
  ingredients: RecipeIngredient[]
}

export interface RecipeBook {
  recipes: Map<string, Recipe>
  names: Record<string, string>
}

export function parseRecipeBook(raw: { r: Record<string, RecipeTuple>; n: Record<string, string> }): RecipeBook {
  const recipes = new Map<string, Recipe>()
  for (const [productId, [amount, itemValue, silver, ingredients]] of Object.entries(raw.r)) {
    recipes.set(productId, {
      productId,
      amount,
      itemValue,
      silver,
      ingredients: ingredients.map(([id, count, returns]) => ({ id, count, returns: returns === 1 })),
    })
  }
  return { recipes, names: raw.n }
}

let bookPromise: Promise<RecipeBook> | null = null

/** Carrega as receitas sob demanda (o arquivo só é baixado na calculadora) */
export function loadRecipeBook(): Promise<RecipeBook> {
  // Importado como texto: evita o TypeScript inferir o tipo de ~7 mil receitas
  bookPromise ??= import('@/data/craft-recipes.json?raw').then((m) => parseRecipeBook(JSON.parse(m.default)))
  return bookPromise
}

// ==================== NOMES ====================

export function craftItemName(id: string, book?: RecipeBook): string {
  const own = book?.names[id]
  if (own) return own
  const parsed = parseItemId(id)
  const item = parsed && findCatalogItem(parsed.baseId)
  return item && parsed ? itemName(item, parsed.tier) : id
}

/** "Couro Curtido T5.1" */
export function craftItemLabel(id: string, book?: RecipeBook): string {
  const parsed = parseItemId(id)
  const name = craftItemName(id, book)
  return parsed ? `${name} T${parsed.tier}.${parsed.enchantment}` : name
}

/** Prata em formato curto: 950 · 15.300 · 1,59M (valores ≥ 100 mil viram k/M) */
export function formatShort(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  if (abs >= 1_000_000_000) return `${sign}${fmt(abs / 1_000_000_000)}B`
  if (abs >= 1_000_000) return `${sign}${fmt(abs / 1_000_000)}M`
  if (abs >= 100_000) return `${sign}${fmt(abs / 1_000)}k`
  return `${sign}${Math.round(abs).toLocaleString('pt-BR')}`
}

// ==================== CATEGORIAS ====================

export interface CraftCategory {
  value: string
  label: string
  group: string
}

export const REFINING_CATEGORY = 'Recursos Refinados'

/** Categorias com receita: refino + categorias do catálogo (sem artefatos e recursos brutos) */
export const CRAFT_CATEGORIES: CraftCategory[] = (() => {
  const seen = new Map<string, CraftCategory>()
  for (const item of CATALOG) {
    if (item.group === 'Artefatos' || item.category === 'Recursos Brutos') continue
    const group = item.category === REFINING_CATEGORY ? 'Refino' : item.group
    if (!seen.has(item.category)) {
      seen.set(item.category, {
        value: item.category,
        label: item.category === REFINING_CATEGORY ? 'Refino (todos os recursos)' : item.category,
        group,
      })
    }
  }
  return [...seen.values()].sort((a, b) =>
    a.group === 'Refino' ? -1 : b.group === 'Refino' ? 1 : a.group.localeCompare(b.group) || a.label.localeCompare(b.label),
  )
})()

/** Ids de produto (com tier/encantamento) de uma categoria que possuem receita */
export function productsForCategory(
  category: string,
  book: RecipeBook,
  tiers: number[] = [],
  enchants: number[] = [],
): string[] {
  const ids: string[] = []
  for (const item of CATALOG) {
    if (item.category !== category) continue
    for (const id of variantIds(item)) {
      const parsed = parseItemId(id)!
      if (tiers.length && !tiers.includes(parsed.tier)) continue
      if (enchants.length && !enchants.includes(parsed.enchantment)) continue
      if (book.recipes.has(id)) ids.push(id)
    }
  }
  return ids
}

function variantIds(item: CatalogItem): string[] {
  const ids: string[] = []
  for (const tier of item.tiers) {
    for (let e = 0; e <= item.maxEnchant; e++) {
      const base = `T${tier}_${item.baseId}`
      ids.push(e === 0 ? base : item.leveled ? `${base}_LEVEL${e}@${e}` : `${base}@${e}`)
    }
  }
  return ids
}

// ==================== REGRAS DO JOGO ====================

/** Cidades com estações de produção */
export const PRODUCTION_CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Brecilien',
] as const

/** Cidade com bônus de refino para cada recurso refinado */
export const REFINING_BONUS_CITY: Record<string, string> = {
  METALBAR: 'Thetford',
  PLANKS: 'Fort Sterling',
  CLOTH: 'Lymhurst',
  LEATHER: 'Martlock',
  STONEBLOCK: 'Bridgewatch',
}

/** Bônus de produção (%) usados na fórmula de retorno de recursos */
export const PRODUCTION_BONUS = { base: 18, refiningCity: 40, focus: 59 }

/** Taxa cobrada ao criar uma ordem de compra ou venda */
export const SETUP_FEE = 0.025

/** Uma unidade de nutrição custa 0,1125 × valor do item; a tarifa é cobrada a cada 100 de nutrição */
const NUTRITION_PER_ITEM_VALUE = 0.1125

export function refiningBonusCity(productId: string): string | null {
  const parsed = parseItemId(productId)
  return parsed ? (REFINING_BONUS_CITY[parsed.baseId] ?? null) : null
}

/** Taxa de retorno de recursos: 1 - 1 / (1 + bônus) */
export function returnRateFromBonus(bonusPercent: number): number {
  return 1 - 1 / (1 + bonusPercent / 100)
}

/** Taxa de retorno padrão produzindo em uma cidade real (com bônus de refino quando aplicável) */
export function defaultReturnRate(productId: string, city: string | null, focus: boolean): number {
  let bonus = PRODUCTION_BONUS.base
  const bonusCity = refiningBonusCity(productId)
  if (bonusCity && city === bonusCity) bonus += PRODUCTION_BONUS.refiningCity
  if (focus) bonus += PRODUCTION_BONUS.focus
  return returnRateFromBonus(bonus)
}

export function stationFeePerCraft(itemValue: number, stationFee: number): number {
  return (itemValue * NUTRITION_PER_ITEM_VALUE * stationFee) / 100
}

export function salesTaxRate(premium: boolean): number {
  return premium ? SALES_TAX.premium : SALES_TAX.standard
}

// ==================== PREÇOS ====================

export type PriceIndex = Map<string, Map<string, AlbionPriceData>>

export function buildPriceIndex(prices: AlbionPriceData[]): PriceIndex {
  const index: PriceIndex = new Map()
  for (const p of prices) {
    let byCity = index.get(p.item_id)
    if (!byCity) index.set(p.item_id, (byCity = new Map()))
    byCity.set(p.city, p)
  }
  return index
}

function ageHours(date: string, now: number): number {
  const iso = /Z|[+-]\d\d:?\d\d$/.test(date) ? date : `${date}Z`
  return (now - new Date(iso).getTime()) / 3_600_000
}

export interface PricePoint {
  city: string
  price: number
  date: string
}

/**
 * Preço utilizável de um item numa cidade.
 * - sell: menor ordem de venda (preço para comprar na hora / referência de venda)
 * - buy: maior ordem de compra (preço para vender na hora / referência de pedido)
 */
export function priceAt(
  index: PriceIndex,
  id: string,
  city: string,
  kind: 'sell' | 'buy',
  maxAgeHours = Infinity,
  now = Date.now(),
): PricePoint | null {
  const p = index.get(id)?.get(city)
  if (!p) return null
  const price = kind === 'sell' ? p.sell_price_min : p.buy_price_max
  const date = kind === 'sell' ? p.sell_price_min_date : p.buy_price_max_date
  if (!price || !hasDate(date) || ageHours(date, now) > maxAgeHours) return null
  return { city, price, date }
}

/**
 * Melhor preço entre as cidades. Por padrão, o menor de 'sell' (onde comprar mais barato)
 * e o maior de 'buy' (onde vender na hora mais caro). Para anunciar uma venda, use
 * kind 'sell' com prefer 'high': a cidade onde a ordem de venda mais barata é a mais alta.
 */
export function bestPrice(
  index: PriceIndex,
  id: string,
  cities: readonly string[],
  kind: 'sell' | 'buy',
  maxAgeHours = Infinity,
  now = Date.now(),
  prefer: 'low' | 'high' = kind === 'sell' ? 'low' : 'high',
): PricePoint | null {
  let best: PricePoint | null = null
  for (const city of cities) {
    const point = priceAt(index, id, city, kind, maxAgeHours, now)
    if (!point) continue
    if (!best || (prefer === 'low' ? point.price < best.price : point.price > best.price)) best = point
  }
  return best
}

// ==================== SCANNER DE OPORTUNIDADES ====================

/** Configuração compartilhada entre o scanner e a calculadora detalhada */
export interface CalculatorDefaults {
  premium: boolean
  stationFee: number
  /** null = automático */
  returnRate: number | null
  focus: boolean
  cities: string[]
}

export interface ScanSettings {
  cities: string[]
  /** null = automático (base + bônus da cidade de refino) */
  returnRate: number | null
  focus: boolean
  premium: boolean
  stationFee: number
  /** Ignora preços mais antigos que isso para não gerar margens fantasmas */
  maxAgeHours: number
}

export interface Opportunity {
  productId: string
  amount: number
  buyCity: string | null
  buyLines: Array<{ id: string; city: string; price: number; count: number }>
  costPerCraft: number
  costPerUnit: number
  sellCity: string
  sellMode: 'order' | 'instant'
  sellGross: number
  sellNet: number
  profit: number
  margin: number
  returnRate: number
  productionCity: string | null
  /** Data mais antiga entre os preços usados */
  oldestDate: string
}

export function scanOpportunities(
  productIds: string[],
  book: RecipeBook,
  index: PriceIndex,
  settings: ScanSettings,
  now = Date.now(),
): Opportunity[] {
  const marketCities = settings.cities.filter((c) => c !== 'Black Market')
  const sellsToBlackMarket = settings.cities.includes('Black Market')
  const tax = salesTaxRate(settings.premium)
  const results: Opportunity[] = []

  for (const productId of productIds) {
    const recipe = book.recipes.get(productId)
    if (!recipe) continue

    const productionCity = refiningBonusCity(productId)
    const rate = settings.returnRate ?? defaultReturnRate(productId, productionCity, settings.focus)

    // Compra: cada ingrediente na cidade mais barata
    const buyLines: Opportunity['buyLines'] = []
    let materials = 0
    let oldest = ''
    let missing = false
    for (const ing of recipe.ingredients) {
      const best = bestPrice(index, ing.id, marketCities, 'sell', settings.maxAgeHours, now)
      if (!best) {
        missing = true
        break
      }
      buyLines.push({ id: ing.id, city: best.city, price: best.price, count: ing.count })
      materials += ing.count * best.price * (ing.returns ? 1 - rate : 1)
      if (!oldest || best.date < oldest) oldest = best.date
    }
    if (missing) continue

    // Venda: ordem de venda nas cidades ou venda imediata no Black Market
    const sellOrder = bestPrice(index, productId, marketCities, 'sell', settings.maxAgeHours, now, 'high')
    const blackMarket = sellsToBlackMarket
      ? priceAt(index, productId, 'Black Market', 'buy', settings.maxAgeHours, now)
      : null
    const orderNet = sellOrder ? sellOrder.price * (1 - tax - SETUP_FEE) : 0
    const instantNet = blackMarket ? blackMarket.price * (1 - tax) : 0
    if (!orderNet && !instantNet) continue

    const useInstant = instantNet > orderNet
    const sell = (useInstant ? blackMarket : sellOrder)!
    const sellNet = useInstant ? instantNet : orderNet
    if (sell.date < oldest) oldest = sell.date

    const costPerCraft = materials + stationFeePerCraft(recipe.itemValue, settings.stationFee) + recipe.silver
    const costPerUnit = costPerCraft / recipe.amount
    const profit = sellNet - costPerUnit
    const cities = new Set(buyLines.map((l) => l.city))

    results.push({
      productId,
      amount: recipe.amount,
      buyCity: cities.size === 1 ? [...cities][0] : null,
      buyLines,
      costPerCraft,
      costPerUnit,
      sellCity: sell.city,
      sellMode: useInstant ? 'instant' : 'order',
      sellGross: sell.price,
      sellNet,
      profit,
      margin: costPerUnit > 0 ? profit / costPerUnit : 0,
      returnRate: rate,
      productionCity,
      oldestDate: oldest,
    })
  }

  return results.sort((a, b) => b.margin - a.margin)
}

// ==================== CALCULADORA DETALHADA ====================

export interface CraftPlanInput {
  recipe: Recipe
  /** 'value' = quanto investir (prata) · 'quantity' = quantas unidades produzir */
  mode: 'value' | 'quantity'
  amount: number
  ingredientPrices: Record<string, number>
  /** Taxa sobre a compra (SETUP_FEE quando por pedido de compra, 0 na compra direta) */
  buyFeeRate: number
  returnRate: number
  stationFee: number
  sellPrice: number
  /** Taxa total sobre a venda (imposto + taxa de anúncio quando por ordem de venda) */
  sellFeeRate: number
}

export interface CraftPlanLine {
  id: string
  count: number
  returns: boolean
  quantity: number
  unitPrice: number
  fee: number
  total: number
}

export interface CraftPlan {
  /** Crafts realizados contando com os recursos devolvidos */
  outputCrafts: number
  /** Crafts que os materiais comprados rendem sem retorno */
  materialCrafts: number
  units: number
  lines: CraftPlanLine[]
  materialsTotal: number
  stationPerCraft: number
  stationTotal: number
  totalCost: number
  gross: number
  sellFee: number
  net: number
  profit: number
  margin: number
}

export function planCraft(input: CraftPlanInput): CraftPlan {
  const { recipe, returnRate: rate, buyFeeRate } = input
  const keep = (ing: RecipeIngredient) => (ing.returns ? 1 - rate : 1)
  const stationPerCraft = stationFeePerCraft(recipe.itemValue, input.stationFee) + recipe.silver

  const costPerCraft =
    recipe.ingredients.reduce(
      (sum, ing) => sum + ing.count * (input.ingredientPrices[ing.id] ?? 0) * (1 + buyFeeRate) * keep(ing),
      0,
    ) + stationPerCraft

  let outputCrafts: number
  if (input.mode === 'quantity') {
    outputCrafts = Math.ceil(Math.max(0, input.amount) / recipe.amount)
  } else {
    outputCrafts = costPerCraft > 0 ? Math.floor(Math.max(0, input.amount) / costPerCraft) : 0
  }

  const lines: CraftPlanLine[] = recipe.ingredients.map((ing) => {
    const quantity = Math.ceil(outputCrafts * ing.count * keep(ing) - 1e-9)
    const unitPrice = input.ingredientPrices[ing.id] ?? 0
    const subtotal = quantity * unitPrice
    const fee = subtotal * buyFeeRate
    return { id: ing.id, count: ing.count, returns: ing.returns, quantity, unitPrice, fee, total: subtotal + fee }
  })

  const materialsTotal = lines.reduce((sum, l) => sum + l.total, 0)
  const stationTotal = stationPerCraft * outputCrafts
  const totalCost = materialsTotal + stationTotal
  const units = outputCrafts * recipe.amount
  const gross = units * input.sellPrice
  const sellFee = gross * input.sellFeeRate
  const net = gross - sellFee
  const profit = net - totalCost

  return {
    outputCrafts,
    materialCrafts: Math.ceil(outputCrafts * (1 - rate) - 1e-9),
    units,
    lines,
    materialsTotal,
    stationPerCraft,
    stationTotal,
    totalCost,
    gross,
    sellFee,
    net,
    profit,
    margin: totalCost > 0 ? profit / totalCost : 0,
  }
}
