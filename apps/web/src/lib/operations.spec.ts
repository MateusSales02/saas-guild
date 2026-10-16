import { describe, expect, it } from 'vitest'
import { compactSilver, dayToIso, isoDay, percent, previewProfit, signedSilver } from './operations'

describe('previewProfit', () => {
  it('desconta a taxa do mercado da venda e calcula margem', () => {
    expect(previewProfit({ cost: 1000, feeRate: 6.5, revenue: 2000 })).toEqual({
      totalCost: 1000,
      revenue: 2000,
      tax: 130,
      profit: 870,
      margin: 0.87,
    })
  })

  it('ignora campos vazios ou negativos', () => {
    expect(previewProfit({ cost: null, feeRate: -5, revenue: undefined })).toEqual({
      totalCost: 0,
      revenue: 0,
      tax: 0,
      profit: 0,
      margin: null,
    })
  })
})

describe('formatação', () => {
  it('formata prata com sinal', () => {
    expect(signedSilver(1500)).toBe('+1.500g')
    expect(signedSilver(-1500)).toBe('−1.500g')
    expect(signedSilver(0)).toBe('0g')
  })

  it('compacta valores grandes', () => {
    expect(compactSilver(1_250_000)).toBe('1,3M')
    expect(compactSilver(-45_000)).toBe('−45k')
    expect(compactSilver(2_000_000_000)).toBe('2B')
    expect(compactSilver(800)).toBe('800')
  })

  it('formata porcentagem e trata nulos', () => {
    expect(percent(0.256, 1)).toBe('25,6%')
    expect(percent(null)).toBe('—')
  })

  it('converte datas do input sem trocar o dia', () => {
    const iso = dayToIso('2026-10-15')
    expect(isoDay(new Date(iso))).toBe('2026-10-15')
  })
})
