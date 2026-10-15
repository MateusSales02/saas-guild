import { describe, expect, it } from 'vitest'
import { buildAuthor, emptyLoadout, normalizeLoadout, parseVideoIds, renderMarkdown, type BuildData } from './builds'

const data: BuildData = {
  items: { T8_MAIN_SWORD: { n: 'Espada Larga', s: 'weapon', c: 'Espadas' } },
  spells: { MIGHTYBLOW: { n: 'Pancada Potente' } },
  traits: [],
}

describe('renderMarkdown', () => {
  it('escapa HTML antes de aplicar a formatação', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)> **ok**', data)
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img')
    expect(html).toContain('<strong>ok</strong>')
  })

  it('só gera links http(s)', () => {
    expect(renderMarkdown('[a](javascript:alert(1))', data)).not.toContain('<a ')
    expect(renderMarkdown('[guia](https://exemplo.com)', data)).toContain(
      '<a href="https://exemplo.com" target="_blank" rel="noopener noreferrer">guia</a>',
    )
  })

  it('monta títulos, listas e parágrafos', () => {
    const html = renderMarkdown('# Rotação\n- Q\n- W\n\n1. primeiro\n2. segundo\n\ntexto', data)
    expect(html).toBe(
      '<h3>Rotação</h3><ul><li>Q</li><li>W</li></ul><ol><li>primeiro</li><li>segundo</li></ol><p>texto</p>',
    )
  })

  it('troca marcadores de item e habilidade por ícone e nome', () => {
    const html = renderMarkdown('Use [item:T8_MAIN_SWORD] e [habilidade:MIGHTYBLOW]', data)
    expect(html).toContain('/v1/item/T8_MAIN_SWORD.png')
    expect(html).toContain('Espada Larga')
    expect(html).toContain('/v1/spell/MIGHTYBLOW.png')
    expect(html).toContain('Pancada Potente')
  })
})

describe('parseVideoIds', () => {
  it('aceita IDs e links do YouTube separados por vírgula', () => {
    expect(
      parseVideoIds('KmFHDQd3M5w, https://www.youtube.com/watch?v=NRQg_Ha4kXc, https://youtu.be/abcdefghijk'),
    ).toEqual(['KmFHDQd3M5w', 'NRQg_Ha4kXc', 'abcdefghijk'])
  })

  it('descarta valores inválidos e limita a 5 vídeos', () => {
    expect(parseVideoIds('x, <script>, ')).toEqual([])
    expect(parseVideoIds('aaaaaa1,aaaaaa2,aaaaaa3,aaaaaa4,aaaaaa5,aaaaaa6')).toHaveLength(5)
  })
})

describe('normalizeLoadout', () => {
  it('devolve a estrutura completa para valores vazios ou inválidos', () => {
    expect(normalizeLoadout(null)).toEqual(emptyLoadout())
    expect(normalizeLoadout('lixo')).toEqual(emptyLoadout())
  })

  it('preserva escolhas salvas e completa o que falta', () => {
    const loadout = normalizeLoadout({
      equipment: { weapon: { rec: 'T8_MAIN_SWORD' } },
      spells: { weapon: { e: { rec: 'MIGHTYBLOW', alt: null } } },
      traits: ['A', 'B', 'C', 'D', 5],
    })
    expect(loadout.equipment.weapon).toEqual({ rec: 'T8_MAIN_SWORD', alt: null })
    expect(loadout.equipment.cape).toEqual({ rec: null, alt: null })
    expect(loadout.spells.weapon.e.rec).toBe('MIGHTYBLOW')
    expect(loadout.spells.head.a).toEqual({ rec: null, alt: null })
    expect(loadout.traits).toEqual(['A', 'B', 'C'])
  })
})

describe('buildAuthor', () => {
  it('prefere o nome definido na build, depois o apelido da conta', () => {
    expect(buildAuthor({ author_name: 'Arreat', author: { nickname: 'outro' } })).toBe('Arreat')
    expect(buildAuthor({ author: { nickname: 'Mateus' } })).toBe('Mateus')
    expect(buildAuthor({ author: { email: 'joao@x.com' } })).toBe('joao')
    expect(buildAuthor({})).toBe('Anônimo')
  })
})
