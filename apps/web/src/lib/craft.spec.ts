import { describe, expect, it } from 'vitest'
import type { AlbionPriceData } from '@/lib/api'
import {
  CRAFT_CATEGORIES,
  SETUP_FEE,
  bestPrice,
  buildPriceIndex,
  craftItemLabel,
  defaultReturnRate,
  loadRecipeBook,
  parseRecipeBook,
  planCraft,
  priceAt,
  productsForCategory,
  refiningBonusCity,
  returnRateFromBonus,
  scanOpportunities,
  stationFeePerCraft,
} from './craft'

const NOW = new Date('2026-10-14T12:00:00Z').getTime()
const FRESH = '2026-10-14T10:00:00'
const OLD = '2026-10-01T10:00:00'

function price(item: string, city: string, sell: number, buy: number, date = FRESH): AlbionPriceData {
  return {
    item_id: item,
    city,
    quality: 1,
    sell_price_min: sell,
    sell_price_min_date: date,
    sell_price_max: sell,
    sell_price_max_date: date,
    buy_price_min: buy,
    buy_price_min_date: date,
    buy_price_max: buy,
    buy_price_max_date: date,
  }
}

const book = parseRecipeBook({
  r: {
    T6_LEATHER: [1, 64, 0, [['T6_HIDE', 4, 1], ['T5_LEATHER', 1, 1]]],
    T4_2H_CLAYMORE_AVALON: [1, 1000, 0, [['T4_METALBAR', 20, 1], ['T4_ARTEFACT_2H_CLAYMORE_AVALON', 1, 0]]],
  },
  n: { T6_HIDE: 'Pelego Robusto' },
})

describe('regras do jogo', () => {
  it('calcula a taxa de retorno pela fórmula de bônus de produção', () => {
    expect(returnRateFromBonus(0)).toBe(0)
    expect(defaultReturnRate('T6_LEATHER', 'Caerleon', false)).toBeCloseTo(0.1525, 3)
    expect(defaultReturnRate('T6_LEATHER', 'Martlock', false)).toBeCloseTo(0.367, 3)
    expect(defaultReturnRate('T6_LEATHER', 'Martlock', true)).toBeCloseTo(0.539, 3)
    expect(refiningBonusCity('T5_METALBAR_LEVEL1@1')).toBe('Thetford')
    expect(refiningBonusCity('T4_MAIN_SWORD')).toBeNull()
  })

  it('calcula a tarifa da estação a partir do valor do item', () => {
    expect(stationFeePerCraft(64, 900)).toBeCloseTo(64.8)
    expect(stationFeePerCraft(64, 0)).toBe(0)
  })

  it('nomeia itens com tier e encantamento', () => {
    expect(craftItemLabel('T6_HIDE', book)).toBe('Pelego Robusto T6.0')
    expect(craftItemLabel('T4_MAIN_SWORD@2')).toBe('Espada Larga T4.2')
  })
})

describe('planCraft', () => {
  const recipe = book.recipes.get('T6_LEATHER')!
  const base = {
    recipe,
    ingredientPrices: { T6_HIDE: 1590, T5_LEATHER: 1410 },
    buyFeeRate: 0,
    returnRate: 0.47,
    stationFee: 900,
    sellPrice: 5348,
    sellFeeRate: 0.04 + SETUP_FEE,
  }

  it('reproduz o exemplo do vídeo: 1M investido com 47% de retorno', () => {
    const plan = planCraft({ ...base, mode: 'value', amount: 1_000_000 })
    expect(plan.outputCrafts).toBe(239)
    expect(plan.materialCrafts).toBe(127)
    expect(plan.lines.map((l) => l.quantity)).toEqual([507, 127])
    expect(plan.totalCost).toBeLessThanOrEqual(1_000_000 + 2000)
  })

  it('calcula a quantidade objetivo e o lucro', () => {
    const plan = planCraft({ ...base, mode: 'quantity', amount: 1000 })
    expect(plan.outputCrafts).toBe(1000)
    expect(plan.lines.map((l) => l.quantity)).toEqual([2120, 530])
    expect(plan.gross).toBe(5_348_000)
    expect(plan.net).toBeCloseTo(5_348_000 * (1 - 0.065))
    expect(plan.profit).toBeCloseTo(plan.net - plan.totalCost)
    expect(plan.margin).toBeCloseTo(plan.profit / plan.totalCost)
  })

  it('aplica a taxa do pedido de compra e não devolve artefatos', () => {
    const plan = planCraft({
      ...base,
      recipe: book.recipes.get('T4_2H_CLAYMORE_AVALON')!,
      ingredientPrices: { T4_METALBAR: 100, T4_ARTEFACT_2H_CLAYMORE_AVALON: 10_000 },
      buyFeeRate: SETUP_FEE,
      returnRate: 0.5,
      mode: 'quantity',
      amount: 10,
    })
    expect(plan.lines[0]).toMatchObject({ quantity: 100, fee: 100 * 100 * SETUP_FEE })
    expect(plan.lines[1]).toMatchObject({ quantity: 10, returns: false })
  })

  it('não quebra com investimento zero ou sem preços', () => {
    const plan = planCraft({ ...base, ingredientPrices: {}, stationFee: 0, mode: 'value', amount: 0 })
    expect(plan.outputCrafts).toBe(0)
    expect(plan.margin).toBe(0)
  })
})

describe('preços e scanner', () => {
  const index = buildPriceIndex([
    price('T6_HIDE', 'Thetford', 1590, 1500),
    price('T6_HIDE', 'Martlock', 1980, 1770),
    price('T5_LEATHER', 'Thetford', 1410, 1380),
    price('T5_LEATHER', 'Lymhurst', 1300, 0, OLD),
    price('T6_LEATHER', 'Bridgewatch', 5348, 5030),
    price('T6_LEATHER', 'Martlock', 5000, 0),
  ])

  it('escolhe o melhor preço ignorando dados antigos', () => {
    expect(bestPrice(index, 'T5_LEATHER', ['Thetford', 'Lymhurst'], 'sell', 48, NOW)?.city).toBe('Thetford')
    expect(bestPrice(index, 'T5_LEATHER', ['Thetford', 'Lymhurst'], 'sell', Infinity, NOW)?.city).toBe('Lymhurst')
    expect(bestPrice(index, 'T6_LEATHER', ['Bridgewatch', 'Martlock'], 'buy', 48, NOW)?.price).toBe(5030)
    expect(priceAt(index, 'T6_HIDE', 'Caerleon', 'sell')).toBeNull()
  })

  it('encontra oportunidades com custo real e venda líquida', () => {
    const [opp] = scanOpportunities(
      ['T6_LEATHER', 'T4_2H_CLAYMORE_AVALON'],
      book,
      index,
      {
        cities: ['Thetford', 'Martlock', 'Bridgewatch', 'Lymhurst'],
        returnRate: 0.47,
        focus: false,
        premium: true,
        stationFee: 900,
        maxAgeHours: 48,
      },
      NOW,
    )
    expect(opp.productId).toBe('T6_LEATHER')
    expect(opp.buyCity).toBe('Thetford')
    expect(opp.sellCity).toBe('Bridgewatch')
    expect(opp.sellMode).toBe('order')
    expect(opp.costPerUnit).toBeCloseTo((4 * 1590 + 1410) * 0.53 + 64.8)
    expect(opp.sellNet).toBeCloseTo(5348 * (1 - 0.04 - SETUP_FEE))
    expect(opp.margin).toBeCloseTo(opp.profit / opp.costPerUnit)
    expect(opp.productionCity).toBe('Martlock')
  })

  it('usa a taxa de retorno automática quando não informada', () => {
    const [opp] = scanOpportunities(
      ['T6_LEATHER'],
      book,
      index,
      { cities: ['Thetford', 'Bridgewatch'], returnRate: null, focus: true, premium: false, stationFee: 0, maxAgeHours: 48 },
      NOW,
    )
    expect(opp.returnRate).toBeCloseTo(0.539, 3)
  })
})

describe('receitas reais', () => {
  it('carrega as receitas do dump oficial', async () => {
    const real = await loadRecipeBook()
    expect(real.recipes.get('T6_LEATHER')).toMatchObject({ amount: 1, itemValue: 64 })
    expect(real.recipes.get('T4_POTION_HEAL')?.amount).toBe(5)
    expect(real.recipes.get('T4_2H_CLAYMORE_AVALON@1')?.ingredients.find((i) => !i.returns)?.id).toBe(
      'T4_ARTEFACT_2H_CLAYMORE_AVALON',
    )
    expect(productsForCategory('Recursos Refinados', real, [6], [0])).toContain('T6_LEATHER')
    expect(productsForCategory('Recursos Refinados', real, [6], [1])).toContain('T6_LEATHER_LEVEL1@1')
    expect(CRAFT_CATEGORIES[0].group).toBe('Refino')
  })
})
