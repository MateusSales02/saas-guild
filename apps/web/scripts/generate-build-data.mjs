/**
 * Gera src/data/build-data.json para o editor de builds a partir dos dumps oficiais
 * do Albion Online (https://github.com/ao-data/ao-bin-dumps): equipamentos, consumíveis,
 * habilidades de cada item e características de armas despertadas, tudo em PT-BR.
 *
 * Uso: node scripts/generate-build-data.mjs [pasta-com-os-dumps]
 * A pasta deve conter items.json, formatted-items.json, spells.json, localization.json
 * e legendaryitems.json. Sem argumento, os arquivos são baixados do GitHub.
 *
 * Formato de saída:
 * {
 *   items:  { [id]: { n: nome, s: slot, c: categoria, h?: 1 (duas mãos), sp?: { q, w, e, a, p } } },
 *   spells: { [id]: { n: nome, d?: descrição, cd?: recarga, en?: energia } },
 *   traits: [{ id, n, d? }]
 * }
 * O id dos equipamentos é o T8 (ex: T8_MAIN_SWORD); consumíveis usam o id exato.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DUMPS = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master'
const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/build-data.json')

const TIER_SUFFIX = / (?:d[oa] )?(?:Calouro|Novato|Iniciante|Adepto|Perito|Mestre|Grão-mestre|Ancião)$/

const WEAPONS = {
  sword: 'Espadas',
  axe: 'Machados',
  mace: 'Maças',
  hammer: 'Martelos',
  spear: 'Lanças',
  quarterstaff: 'Bastões',
  dagger: 'Adagas',
  knuckles: 'Manoplas',
  bow: 'Arcos',
  crossbow: 'Bestas',
  firestaff: 'Cajados de Fogo',
  froststaff: 'Cajados de Gelo',
  holystaff: 'Cajados Sagrados',
  naturestaff: 'Cajados da Natureza',
  arcanestaff: 'Cajados Arcanos',
  cursestaff: 'Cajados Amaldiçoados',
  shapeshifterstaff: 'Cajados Metamorfos',
}

const ARMORS = {
  plate_helmet: ['head', 'Placa'],
  leather_helmet: ['head', 'Couro'],
  cloth_helmet: ['head', 'Tecido'],
  plate_armor: ['armor', 'Placa'],
  leather_armor: ['armor', 'Couro'],
  cloth_armor: ['armor', 'Tecido'],
  plate_shoes: ['shoes', 'Placa'],
  leather_shoes: ['shoes', 'Couro'],
  cloth_shoes: ['shoes', 'Tecido'],
}

const OFFHANDS = { shieldtype: 'Escudos', booktype: 'Livros', torchtype: 'Tochas' }

/** Retorna [slot, categoria] ou null se o item não entra no editor */
function classify(kind, item) {
  const cat = item['@shopcategory']
  const sub = item['@shopsubcategory1']
  if (cat === 'weapons' && WEAPONS[sub] && (kind === 'weapon' || kind === 'transformationweapon')) return ['weapon', WEAPONS[sub]]
  if (cat === 'offhands' && OFFHANDS[sub]) return ['offhand', OFFHANDS[sub]]
  if (['head', 'armors', 'shoes'].includes(cat) && ARMORS[sub]) return ARMORS[sub]
  if (cat === 'capes' && kind === 'equipmentitem') return ['cape', 'Capas']
  if (cat === 'consumables' && sub === 'potions' && kind === 'consumableitem') return ['potion', 'Poções']
  if (cat === 'consumables' && sub === 'food' && kind === 'consumableitem') return ['food', 'Comidas']
  return null
}

async function loadJson(dir, file, remote = file) {
  if (dir) return JSON.parse(await readFile(path.join(dir, file), 'utf8'))
  const res = await fetch(`${DUMPS}/${remote}`)
  if (!res.ok) throw new Error(`Falha ao baixar ${remote}: ${res.status}`)
  return res.json()
}

const dir = process.argv[2]
const [raw, formatted, spellsDump, localization, legendary] = await Promise.all([
  loadJson(dir, 'items.json'),
  loadJson(dir, 'formatted-items.json', 'formatted/items.json'),
  loadJson(dir, 'spells.json'),
  loadJson(dir, 'localization.json'),
  loadJson(dir, 'legendaryitems.json'),
])

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

const ptItemNames = new Map(
  formatted.filter((i) => i.LocalizedNames?.['PT-BR']).map((i) => [i.UniqueName, i.LocalizedNames['PT-BR'].trim()]),
)

const texts = new Map()
for (const tu of localization.tmx.body.tu) {
  const pt = asArray(tu.tuv).find((v) => v['@xml:lang'] === 'PT-BR')
  if (typeof pt?.seg === 'string') texts.set(tu['@tuid'], pt.seg)
}

// ---------- Itens ----------

const rawById = new Map()
const kindById = new Map()
for (const [kind, list] of Object.entries(raw.items)) {
  if (!Array.isArray(list)) continue
  for (const item of list) {
    rawById.set(item['@uniquename'], item)
    kindById.set(item['@uniquename'], kind)
  }
}

/** Lista de habilidades do item, seguindo as referências entre tiers */
function spellList(id, seen = new Set()) {
  if (seen.has(id)) return []
  seen.add(id)
  const node = rawById.get(id)?.craftingspelllist
  if (!node) return []
  let list = node['@reference'] ? spellList(node['@reference'], seen) : []
  const removed = new Set(asArray(node.removespell).map((s) => s['@uniquename']))
  list = list.filter((s) => !removed.has(s.id))
  for (const s of asArray(node.craftspell)) {
    if (!list.some((x) => x.id === s['@uniquename'])) list.push({ id: s['@uniquename'], slot: s['@slots'] })
  }
  return list
}

const spellDefs = new Map()
for (const kind of ['activespell', 'passivespell', 'togglespell']) {
  for (const s of asArray(spellsDump.spells[kind])) spellDefs.set(s['@uniquename'], { kind, def: s })
}

const usedSpells = new Set()
const items = {}

for (const [id, item] of rawById) {
  const kind = kindById.get(id)
  const group = classify(kind, item)
  if (!group) continue
  if (item['@tradable'] === 'false' || item['@showinmarketplace'] === 'false') continue
  const match = /^T(\d)_(.+)$/.exec(id)
  if (!match) continue
  const [slot, category] = group
  const consumable = slot === 'potion' || slot === 'food'
  const name = ptItemNames.get(id)
  if (!name) continue

  // Equipamentos: só a versão de maior tier (até T8) de cada família
  if (!consumable) {
    const tier = Number(match[1])
    const higher = [8, 7, 6, 5].find((t) => t > tier && rawById.has(`T${t}_${match[2]}`) && classify(kindById.get(`T${t}_${match[2]}`), rawById.get(`T${t}_${match[2]}`)))
    if (higher) continue
  }

  const entry = { n: consumable ? name : name.replace(TIER_SUFFIX, ''), s: slot, c: category }
  if (item['@twohanded'] === 'true') entry.h = 1

  if (!consumable) {
    const sp = {}
    for (const { id: spellId, slot: spellSlot } of spellList(id)) {
      const def = spellDefs.get(spellId)
      if (!def) continue
      const passive = def.kind === 'passivespell'
      let key
      if (slot === 'weapon') key = passive ? 'p' : { 1: 'q', 2: 'w', 3: 'e' }[spellSlot]
      else key = passive ? 'p' : 'a'
      if (!key) continue
      ;(sp[key] ??= []).push(spellId)
      usedSpells.add(spellId)
    }
    if (Object.keys(sp).length) entry.sp = sp
  }
  items[id] = entry
}

// ---------- Habilidades ----------

/** Remove marcações do jogo e valores calculados ({0}) que não temos como resolver */
function cleanDescription(text) {
  if (!text) return undefined
  return (
    text
      .split('\n')
      .filter((line) => !/\{\d+\}/.test(line) || !line.trim().startsWith('[#]'))
      .join('\n')
      .replace(/\{\d+\}/g, 'X')
      .replace(/\[#\]\s*/g, '• ')
      .replace(/\[\/?[a-z]+\]/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || undefined
  )
}

function spellName(def) {
  return texts.get(def['@namelocatag'] ?? `@SPELLS_${def['@uniquename']}`)
}

const spells = {}
for (const id of usedSpells) {
  const { def } = spellDefs.get(id)
  const n = spellName(def)
  if (!n) continue
  const entry = { n }
  const d = cleanDescription(texts.get(def['@descriptionlocatag'] ?? `@SPELLS_${id}_DESC`))
  if (d) entry.d = d
  const cd = Number(def['@recastdelay'] ?? 0)
  const en = Number(def['@energyusage'] ?? 0)
  if (cd) entry.cd = cd
  if (en) entry.en = en
  spells[id] = entry
}

// Habilidades sem nome traduzido saem das listas dos itens
for (const item of Object.values(items)) {
  if (!item.sp) continue
  for (const key of Object.keys(item.sp)) {
    item.sp[key] = item.sp[key].filter((s) => spells[s])
    if (!item.sp[key].length) delete item.sp[key]
  }
  if (!Object.keys(item.sp).length) delete item.sp
}

// ---------- Características (armas despertadas) ----------

// Características que o jogo não nomeia na localização (o nome aparece só no ícone)
const TRAIT_NAMES = {
  PASSIVE_TRAIT_ENERGY_COST_REDUCTION: 'Redução de Custo de Energia',
  PASSIVE_TRAIT_HITPOINTS_MAX: 'Vida Máxima',
  PASSIVE_TRAIT_ITEM_POWER: 'Poder de Item',
  PASSIVE_TRAIT_ENERGY_MAX: 'Energia Máxima',
  PASSIVE_TRAIT_CC_RESIST: 'Resistência a Controle de Grupo',
  PASSIVE_TRAIT_MOB_FAME: 'Fama de Criaturas',
  PASSIVE_TRAIT_RESILIENCE_PENETRATION: 'Penetração de Resiliência',
  PASSIVE_TRAIT_CAST_SPEED_INCREASE: 'Velocidade de Conjuração',
  PASSIVE_TRAIT_COOLDOWN_REDUCTION: 'Redução de Recarga',
}

const traits = []
for (const t of asArray(legendary.legendaries.traitconfiguration?.traitpool?.trait)) {
  const def = spellDefs.get(t['@spell'])?.def
  const n = texts.get(t['@name']) ?? (def && spellName(def)) ?? TRAIT_NAMES[t['@spell']]
  if (!n) continue
  const entry = { id: t['@spell'], n }
  const d = def && cleanDescription(texts.get(def['@descriptionlocatag'] ?? `@SPELLS_${t['@spell']}_DESC`))
  if (d) entry.d = d
  traits.push(entry)
}
traits.sort((a, b) => a.n.localeCompare(b.n, 'pt-BR'))

const sortedItems = Object.fromEntries(
  Object.entries(items).sort(([, a], [, b]) => a.s.localeCompare(b.s) || a.c.localeCompare(b.c) || a.n.localeCompare(b.n, 'pt-BR')),
)

await writeFile(OUTPUT, JSON.stringify({ items: sortedItems, spells, traits }) + '\n')
const bySlot = {}
for (const i of Object.values(items)) bySlot[i.s] = (bySlot[i.s] ?? 0) + 1
console.log(`${Object.keys(items).length} itens`, bySlot)
console.log(`${Object.keys(spells).length} habilidades, ${traits.length} características`)
console.log(`Gravado em ${path.relative(process.cwd(), OUTPUT)}`)
