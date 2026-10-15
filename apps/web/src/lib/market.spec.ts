import { describe, expect, it } from 'vitest'
import type { AlbionHistoryData, AlbionPriceData } from '@/lib/api'
import {
  CATALOG,
  buildCatalog,
  buildChartSeries,
  buildCityRows,
  buildItemId,
  findCatalogItem,
  formatAge,
  formatApiDate,
  formatCompact,
  getItemIconUrl,
  getSpellIconUrl,
  formatSilver,
  getFreshness,
  itemName,
  parseItemId,
  parseSearchQuery,
  searchCatalog,
  summarizeMarket,
} from './market'

function price(city: string, sell: number, buy: number, date = '2026-10-14T10:00:00'): AlbionPriceData {
  return {
    item_id: 'T4_BAG',
    city,
    quality: 1,
    sell_price_min: sell,
    sell_price_min_date: date,
    sell_price_max: sell * 2,
    sell_price_max_date: date,
    buy_price_min: 0,
    buy_price_min_date: '0001-01-01T00:00:00',
    buy_price_max: buy,
    buy_price_max_date: date,
  }
}

function hist(location: string, points: Array<[string, number, number]>): AlbionHistoryData {
  return {
    item_id: 'T4_BAG',
    location,
    quality: 1,
    data: points.map(([timestamp, avg_price, item_count]) => ({ timestamp, avg_price, item_count })),
  }
}

describe('catálogo', () => {
  it('normaliza entradas e descarta grupos desconhecidos', () => {
    const catalog = buildCatalog([
      { id: 'ORE', name: 'Minério de Ferro', group: 'Recursos', category: 'Recursos Brutos', tiers: [5, 4], tierNames: { '4': 'Minério de Ferro', '5': 'Minério de Titânio' }, maxEnchant: 4, leveled: true },
      { id: 'X', name: 'x', group: 'Desconhecido', category: 'x', tiers: [4] },
    ])
    expect(catalog).toEqual([
      {
        baseId: 'ORE',
        name: 'Minério de Ferro',
        group: 'Recursos',
        category: 'Recursos Brutos',
        tiers: [4, 5],
        tierNames: { 4: 'Minério de Ferro', 5: 'Minério de Titânio' },
        maxEnchant: 4,
        leveled: true,
        hasQuality: false,
      },
    ])
    expect(itemName(catalog[0], 5)).toBe('Minério de Titânio')
    expect(itemName(catalog[0], 8)).toBe('Minério de Ferro')
  })

  it('carrega o catálogo oficial sem duplicatas e com IDs reais', () => {
    const ids = CATALOG.map((i) => i.baseId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(CATALOG.length).toBeGreaterThan(300)
    expect(findCatalogItem('MAIN_SWORD')?.name).toBe('Espada Larga')
    expect(findCatalogItem('SWORD')).toBeUndefined()
    expect(findCatalogItem('MAIN_RAPIER')).toBeUndefined()
  })
})

describe('IDs de itens', () => {
  it('monta IDs com encantamento respeitando o formato de cada item', () => {
    expect(buildItemId('BAG', 4)).toBe('T4_BAG')
    expect(buildItemId('BAG', 6, 2)).toBe('T6_BAG@2')
    expect(buildItemId('ORE', 5, 1)).toBe('T5_ORE_LEVEL1@1')
    expect(buildItemId('MOUNT_HORSE', 5, 3)).toBe('T5_MOUNT_HORSE')
    expect(buildItemId('POTION_HEAL', 6, 4)).toBe('T6_POTION_HEAL@3')
    expect(buildItemId('UNKNOWN_ITEM', 4, 2)).toBe('T4_UNKNOWN_ITEM@2')
  })

  it('interpreta IDs, inclusive de recursos encantados', () => {
    expect(parseItemId('t6_bag@2')).toEqual({ baseId: 'BAG', tier: 6, enchantment: 2 })
    expect(parseItemId('T5_ORE_LEVEL1@1')).toEqual({ baseId: 'ORE', tier: 5, enchantment: 1 })
    expect(parseItemId('T4_2H_CLAYMORE')).toEqual({ baseId: '2H_CLAYMORE', tier: 4, enchantment: 0 })
    expect(parseItemId('BAG')).toBeNull()
  })

  it('expõe limites de encantamento e qualidade do catálogo', () => {
    expect(findCatalogItem('MOUNT_HORSE')).toMatchObject({ maxEnchant: 0, hasQuality: true })
    expect(findCatalogItem('POTION_HEAL')).toMatchObject({ maxEnchant: 3, hasQuality: false })
    expect(findCatalogItem('MAIN_SWORD')).toMatchObject({ maxEnchant: 4, hasQuality: true })
  })
})

describe('busca', () => {
  it('extrai tier e encantamento do texto', () => {
    expect(parseSearchQuery('espada t6')).toEqual({ text: 'espada', tier: 6, enchantment: undefined })
    expect(parseSearchQuery('5.1 bolsa')).toEqual({ text: 'bolsa', tier: 5, enchantment: 1 })
    expect(parseSearchQuery('T4_BAG@2')).toEqual({ text: 'BAG', tier: 4, enchantment: 2 })
    expect(parseSearchQuery('capa')).toEqual({ text: 'capa', tier: undefined, enchantment: undefined })
  })

  it('encontra itens por nome ignorando acentos e prioriza prefixo', () => {
    const results = searchCatalog('pocao de cura')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((r) => r.group === 'Consumíveis')).toBe(true)

    expect(searchCatalog('bolsa')[0].baseId).toBe('BAG')
    expect(searchCatalog('bag')[0].baseId).toBe('BAG')
    expect(searchCatalog('espada larga')[0].baseId).toBe('MAIN_SWORD')
  })

  it('encontra recursos pelo nome de qualquer tier', () => {
    expect(searchCatalog('titanio').map((i) => i.baseId)).toContain('ORE')
  })

  it('retorna vazio para busca vazia', () => {
    expect(searchCatalog('   ')).toEqual([])
    expect(searchCatalog('t5')).toEqual([])
  })
})

describe('preços', () => {
  const now = new Date('2026-10-14T12:00:00Z').getTime()

  it('classifica a idade dos dados', () => {
    expect(getFreshness('2026-10-14T11:00:00', now)).toBe('fresh')
    expect(getFreshness('2026-10-14T01:00:00', now)).toBe('recent')
    expect(getFreshness('2026-10-10T01:00:00', now)).toBe('stale')
    expect(getFreshness('0001-01-01T00:00:00', now)).toBe('none')
    expect(formatAge('2026-10-14T11:30:00', now)).toBe('30min')
    expect(formatAge('2026-10-14T07:00:00', now)).toBe('5h')
    expect(formatAge('2026-10-11T12:00:00', now)).toBe('3d')
    expect(formatAge(undefined, now)).toBe('—')
  })

  it('formata valores', () => {
    expect(formatSilver(0)).toBe('—')
    expect(formatSilver(1234.6)).toBe('1.235')
    expect(formatCompact(1_500_000)).toBe('1.5M')
    expect(formatCompact(2000)).toBe('2k')
    expect(formatCompact(950)).toBe('950')
    expect(formatApiDate(new Date('2026-03-05T00:00:00Z'))).toBe('03-05-2026')
  })

  it('monta linhas por cidade com média ponderada de 30 dias', () => {
    const rows = buildCityRows(
      [price('Martlock', 1000, 800), price('Unknown City', 1, 1)],
      [hist('Martlock', [['2026-10-01T00:00:00', 900, 10], ['2026-10-02T00:00:00', 1200, 30]])],
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ city: 'Martlock', sellMin: 1000, buyMax: 800, avg30d: 1125, volume30d: 40 })
  })

  it('calcula melhor compra, melhor venda e flip descontando a taxa', () => {
    const rows = buildCityRows([
      price('Martlock', 1000, 700),
      price('Lymhurst', 1200, 900),
      price('Black Market', 0, 2000),
    ])
    const summary = summarizeMarket(rows, true)
    expect(summary.bestSell?.city).toBe('Martlock')
    expect(summary.bestBuy?.city).toBe('Black Market')
    expect(summary.flip).toMatchObject({ from: 'Martlock', to: 'Black Market' })
    expect(summary.flip!.profit).toBeCloseTo(2000 * 0.96 - 1000)

    expect(summarizeMarket(rows, false).flip!.profit).toBeCloseTo(2000 * 0.92 - 1000)
  })

  it('não sugere flip quando compra e venda são na mesma cidade', () => {
    const summary = summarizeMarket(buildCityRows([price('Martlock', 1000, 900)]))
    expect(summary.flip).toBeNull()
    expect(summary.avg30d).toBe(0)
  })

  it('gera séries do gráfico ordenadas e sem valores zerados', () => {
    const series = buildChartSeries([
      hist('Caerleon', [['2026-10-02T00:00:00', 500, 1], ['2026-10-01T00:00:00', 400, 1], ['2026-10-03T00:00:00', 0, 0]]),
      hist('Thetford', []),
    ])
    expect(series).toHaveLength(1)
    expect(series[0].city).toBe('Caerleon')
    expect(series[0].points.map((p) => p.v)).toEqual([400, 500])
  })
})

describe('URLs de ícones', () => {
  it('arredonda para os tamanhos que o servidor já tem em cache (64 e 128)', () => {
    expect(getItemIconUrl('T8_MAIN_SWORD', 1, 40)).toBe('https://render.albiononline.com/v1/item/T8_MAIN_SWORD.png?size=64')
    expect(getItemIconUrl('T8_MAIN_SWORD', 1, 100)).toBe('https://render.albiononline.com/v1/item/T8_MAIN_SWORD.png?size=128')
    expect(getSpellIconUrl('MIGHTYBLOW', 88)).toBe('https://render.albiononline.com/v1/spell/MIGHTYBLOW.png?size=128')
  })

  it('só envia a qualidade quando não é a padrão', () => {
    expect(getItemIconUrl('T4_BAG', 3, 64)).toBe('https://render.albiononline.com/v1/item/T4_BAG.png?size=64&quality=3')
  })

  it('codifica ids com encantamento', () => {
    expect(getItemIconUrl('T4_BAG@2')).toContain('/T4_BAG%402.png')
  })
})
