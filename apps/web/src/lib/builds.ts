import { shallowRef } from 'vue'
import { getItemIconUrl, getSpellIconUrl } from '@/lib/market'

// ==================== DADOS DO JOGO ====================

export type GearSlot = 'weapon' | 'offhand' | 'head' | 'armor' | 'shoes' | 'cape'
export type ConsumableSlot = 'potion' | 'food'
export type ItemSlot = GearSlot | ConsumableSlot

/** Chaves de habilidade: q/w/e da arma, a = ativa da armadura, p = passiva */
export type SpellKey = 'q' | 'w' | 'e' | 'a' | 'p'

export interface GameItem {
  n: string
  s: ItemSlot
  c: string
  h?: 1
  sp?: Partial<Record<SpellKey, string[]>>
}

export interface GameSpell {
  n: string
  d?: string
  cd?: number
  en?: number
}

export interface GameTrait {
  id: string
  n: string
  d?: string
}

export interface BuildData {
  items: Record<string, GameItem>
  spells: Record<string, GameSpell>
  traits: GameTrait[]
}

const buildData = shallowRef<BuildData | null>(null)
let loading: Promise<BuildData> | null = null

/** Carrega o catálogo (~280 KB) sob demanda, uma única vez */
export function loadBuildData(): Promise<BuildData> {
  loading ??= import('@/data/build-data.json?raw').then((m) => {
    const data = JSON.parse(m.default) as BuildData
    buildData.value = data
    return data
  })
  return loading
}

export function useBuildData() {
  void loadBuildData()
  return buildData
}


// ==================== ROTULOS ====================

export const GEAR_SLOTS: { key: GearSlot; label: string; placeholder: string }[] = [
  { key: 'weapon', label: 'Arma', placeholder: 'Selecione a arma' },
  { key: 'offhand', label: 'Mão secundária', placeholder: 'Selecione a mão secundária' },
  { key: 'head', label: 'Cabeça', placeholder: 'Selecione o capacete' },
  { key: 'armor', label: 'Peitoral', placeholder: 'Selecione a armadura' },
  { key: 'shoes', label: 'Botas', placeholder: 'Selecione as botas' },
  { key: 'cape', label: 'Capa', placeholder: 'Selecione a capa' },
]

export const CONSUMABLE_SLOTS: { key: ConsumableSlot; label: string; placeholder: string }[] = [
  { key: 'potion', label: 'Poção', placeholder: 'Selecione a poção' },
  { key: 'food', label: 'Comida', placeholder: 'Selecione a comida' },
]

/** Itens com habilidades escolhíveis e as teclas de cada uma (padrão do jogo) */
export const SPELL_GROUPS: { slot: GearSlot; label: string; keys: { key: SpellKey; label: string; hotkey: string }[] }[] = [
  {
    slot: 'weapon',
    label: 'Habilidades da arma',
    keys: [
      { key: 'q', label: 'Primeira habilidade', hotkey: 'Q' },
      { key: 'w', label: 'Segunda habilidade', hotkey: 'W' },
      { key: 'e', label: 'Habilidade suprema', hotkey: 'E' },
      { key: 'p', label: 'Passiva', hotkey: 'P' },
    ],
  },
  {
    slot: 'head',
    label: 'Habilidades do capacete',
    keys: [
      { key: 'a', label: 'Habilidade', hotkey: 'D' },
      { key: 'p', label: 'Passiva', hotkey: 'P' },
    ],
  },
  {
    slot: 'armor',
    label: 'Habilidades da armadura',
    keys: [
      { key: 'a', label: 'Habilidade', hotkey: 'R' },
      { key: 'p', label: 'Passiva', hotkey: 'P' },
    ],
  },
  {
    slot: 'shoes',
    label: 'Habilidades das botas',
    keys: [
      { key: 'a', label: 'Habilidade', hotkey: 'F' },
      { key: 'p', label: 'Passiva', hotkey: 'P' },
    ],
  },
]

export const BUILD_CATEGORIES = [
  'Fama Solo',
  'Fama em Grupo',
  'Fama em Grupo (Avalon)',
  'Masmorra Corrompida',
  'Névoas (Solo)',
  'Névoas (Dupla)',
  'Mundo Aberto',
  'Gank (Solo)',
  'Gank (Grupo)',
  'Rastreamento (Solo)',
  'Rastreamento (Grupo)',
  'Portal Infernal (2v2)',
  'Profundezas Abissais (2v2)',
  'Arena de Cristal (5v5)',
  'Pequena Escala',
  'ZvZ',
  'Coleta',
] as const

/** Um item representativo por tipo de arma, para a "árvore de armas" */
export const WEAPON_TREE: { category: string; icon: string }[] = [
  { category: 'Espadas', icon: 'T8_MAIN_SWORD' },
  { category: 'Machados', icon: 'T8_MAIN_AXE' },
  { category: 'Maças', icon: 'T8_MAIN_MACE' },
  { category: 'Martelos', icon: 'T8_MAIN_HAMMER' },
  { category: 'Lanças', icon: 'T8_MAIN_SPEAR' },
  { category: 'Bastões', icon: 'T8_2H_QUARTERSTAFF' },
  { category: 'Adagas', icon: 'T8_MAIN_DAGGER' },
  { category: 'Manoplas', icon: 'T8_2H_KNUCKLES_SET1' },
  { category: 'Arcos', icon: 'T8_2H_BOW' },
  { category: 'Bestas', icon: 'T8_2H_CROSSBOW' },
  { category: 'Cajados de Fogo', icon: 'T8_MAIN_FIRESTAFF' },
  { category: 'Cajados de Gelo', icon: 'T8_MAIN_FROSTSTAFF' },
  { category: 'Cajados Arcanos', icon: 'T8_MAIN_ARCANESTAFF' },
  { category: 'Cajados Sagrados', icon: 'T8_MAIN_HOLYSTAFF' },
  { category: 'Cajados da Natureza', icon: 'T8_MAIN_NATURESTAFF' },
  { category: 'Cajados Amaldiçoados', icon: 'T8_MAIN_CURSEDSTAFF' },
  { category: 'Cajados Metamorfos', icon: 'T8_2H_SHAPESHIFTER_SET1' },
]

// ==================== LOADOUT ====================

/** Escolha recomendada e alternativa para um espaço */
export interface Choice {
  rec: string | null
  alt: string | null
}

export interface Loadout {
  equipment: Record<GearSlot, Choice>
  consumables: Record<ConsumableSlot, Choice>
  spells: {
    weapon: Record<'q' | 'w' | 'e' | 'p', Choice>
    head: Record<'a' | 'p', Choice>
    armor: Record<'a' | 'p', Choice>
    shoes: Record<'a' | 'p', Choice>
  }
  traits: string[]
}

const choice = (): Choice => ({ rec: null, alt: null })

export function emptyLoadout(): Loadout {
  return {
    equipment: { weapon: choice(), offhand: choice(), head: choice(), armor: choice(), shoes: choice(), cape: choice() },
    consumables: { potion: choice(), food: choice() },
    spells: {
      weapon: { q: choice(), w: choice(), e: choice(), p: choice() },
      head: { a: choice(), p: choice() },
      armor: { a: choice(), p: choice() },
      shoes: { a: choice(), p: choice() },
    },
    traits: [],
  }
}

/** Completa um loadout salvo (que pode ser parcial ou antigo) com a estrutura atual */
export function normalizeLoadout(raw: unknown): Loadout {
  const base = emptyLoadout()
  if (!raw || typeof raw !== 'object') return base
  const src = raw as Partial<Loadout>
  const fill = (target: Record<string, Choice>, from?: Record<string, Partial<Choice>>) => {
    for (const key of Object.keys(target)) {
      const value = from?.[key]
      if (value) target[key] = { rec: value.rec ?? null, alt: value.alt ?? null }
    }
  }
  fill(base.equipment, src.equipment)
  fill(base.consumables, src.consumables)
  for (const group of Object.keys(base.spells) as (keyof Loadout['spells'])[]) {
    fill(base.spells[group], src.spells?.[group])
  }
  base.traits = Array.isArray(src.traits) ? src.traits.filter((t) => typeof t === 'string').slice(0, 3) : []
  return base
}

// ==================== YOUTUBE ====================

/** Aceita IDs ou links do YouTube separados por vírgula e devolve só os IDs válidos */
export function parseVideoIds(input: string): string[] {
  return input
    .split(',')
    .map((part) => {
      const value = part.trim()
      const fromUrl = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,20})/.exec(value)
      if (fromUrl) return fromUrl[1]
      return /^[\w-]{6,20}$/.test(value) ? value : ''
    })
    .filter(Boolean)
    .slice(0, 5)
}

// ==================== MARKDOWN ====================

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** Ícones no texto: [item:T8_MAIN_SWORD] e [habilidade:MIGHTYBLOW] */
function renderTokens(html: string, data: BuildData | null): string {
  return html.replace(/\[(item|habilidade|spell):([A-Z0-9_@]+)\]/g, (_, kind: string, id: string) => {
    const isItem = kind === 'item'
    const name = isItem ? data?.items[id]?.n : data?.spells[id]?.n
    const src = isItem ? getItemIconUrl(id, 1, 48) : getSpellIconUrl(id, 48)
    return `<span class="md-token"><img src="${src}" alt="" loading="lazy" />${escapeHtml(name ?? id)}</span>`
  })
}

function renderInline(text: string, data: BuildData | null): string {
  let html = escapeHtml(text)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  return renderTokens(html, data)
}

/**
 * Markdown simples e seguro (o texto é escapado antes de qualquer marcação):
 * títulos (#, ##, ###), negrito, itálico, código, links, listas e ícones do jogo.
 */
export function renderMarkdown(source: string, data: BuildData | null): string {
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${paragraph.map((l) => renderInline(l, data)).join('<br />')}</p>`)
    paragraph = []
  }
  const closeList = () => {
    if (list) out.push(`</${list}>`)
    list = null
  }

  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd()
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line)
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line)

    if (!line.trim()) {
      flushParagraph()
      closeList()
    } else if (heading) {
      flushParagraph()
      closeList()
      const level = heading[1].length + 2
      out.push(`<h${level}>${renderInline(heading[2], data)}</h${level}>`)
    } else if (bullet || ordered) {
      flushParagraph()
      const kind = bullet ? 'ul' : 'ol'
      if (list !== kind) {
        closeList()
        out.push(`<${kind}>`)
        list = kind
      }
      out.push(`<li>${renderInline((bullet ?? ordered)![1], data)}</li>`)
    } else {
      closeList()
      paragraph.push(line)
    }
  }
  flushParagraph()
  closeList()
  return out.join('')
}

/** Opção dos seletores de item/habilidade */
export interface PickerOption {
  id: string
  name: string
  group?: string
}

// ==================== REGISTRO DA API ====================

export interface BuildRecord {
  id: number
  name: string
  description?: string | null
  category?: string | null
  tags?: string[] | null
  loadout?: unknown
  author_name?: string | null
  author?: { id: number; nickname?: string; email?: string } | null
  guild?: { id: number; name: string } | null
  videos?: string[] | null
  status?: 'draft' | 'published' | null
  is_public: boolean
  vote_count?: number | null
  created_at: string
  updated_at: string
}

// ==================== OUTROS ====================

export function formatSilver(value: number): string {
  return `${Math.round(value).toLocaleString('pt-BR')} prata`
}

/** Autor exibido: nome definido na build ou o apelido de quem criou */
export function buildAuthor(build: { author_name?: string | null; author?: { nickname?: string; email?: string } | null }): string {
  return build.author_name || build.author?.nickname || build.author?.email?.split('@')[0] || 'Anônimo'
}
