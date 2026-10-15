/**
 * Gera src/data/market-items.json a partir dos dumps oficiais do Albion Online
 * (https://github.com/ao-data/ao-bin-dumps), com IDs válidos e nomes em PT-BR.
 *
 * Uso: node scripts/generate-market-items.mjs [raw-items.json] [formatted-items.json]
 * Sem argumentos, os dumps são baixados do GitHub.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DUMPS = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master'
const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/market-items.json')

// "Espada Larga do Adepto" e "Chapéu do Minerador Adepto" -> remove o sufixo de tier
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
  plate_armor: 'Armaduras de Placa',
  leather_armor: 'Jaquetas de Couro',
  cloth_armor: 'Robes de Tecido',
  plate_helmet: 'Elmos de Placa',
  leather_helmet: 'Capuzes de Couro',
  cloth_helmet: 'Capotes de Tecido',
  plate_shoes: 'Botas de Placa',
  leather_shoes: 'Sapatos de Couro',
  cloth_shoes: 'Sandálias de Tecido',
}

const ARTEFACTS = {
  weapons: 'Artefatos de Arma',
  offhands: 'Artefatos de Mão Secundária',
  armors: 'Artefatos de Armadura',
  head: 'Artefatos de Cabeça',
  shoes: 'Artefatos de Calçado',
  capes: 'Insígnias de Capa',
  fragments: 'Fragmentos',
}

/** Retorna [grupo, categoria] ou null se o item não entra no mercado */
function classify(kind, cat, sub1) {
  if (cat === 'weapons' && WEAPONS[sub1]) return ['Armas', WEAPONS[sub1]]
  if (cat === 'offhands') {
    const label = { shieldtype: 'Escudos', booktype: 'Livros', torchtype: 'Tochas' }[sub1]
    return label ? ['Mão Secundária', label] : null
  }
  if (['armors', 'head', 'shoes'].includes(cat) && ARMORS[sub1]) return ['Armaduras', ARMORS[sub1]]
  if (cat === 'bags') return ['Acessórios', 'Bolsas']
  if (cat === 'capes') return ['Acessórios', 'Capas']
  if (cat === 'crafting' && sub1 === 'resources') return ['Recursos', 'Recursos Brutos']
  if (cat === 'crafting' && sub1 === 'refinedresources') return ['Recursos', 'Recursos Refinados']
  if (cat === 'artefacts' && ARTEFACTS[sub1]) return ['Artefatos', ARTEFACTS[sub1]]
  if (cat === 'consumables' && sub1 === 'potions' && kind === 'consumableitem') return ['Consumíveis', 'Poções']
  if (cat === 'consumables' && sub1 === 'food') return ['Consumíveis', 'Comidas']
  if (cat === 'mounts') {
    const label = { basemounts: 'Montarias', battle_mount: 'Montarias de Batalha', raremounts: 'Montarias Raras' }[sub1]
    return label ? ['Montarias', label] : null
  }
  if (cat === 'gathering' && kind === 'weapon') return ['Coleta', 'Ferramentas']
  if (cat === 'gathering' && kind === 'equipmentitem') return ['Coleta', 'Equipamento de Coleta']
  return null
}

async function loadJson(arg, file) {
  if (arg) return JSON.parse(await readFile(arg, 'utf8'))
  const res = await fetch(`${DUMPS}/${file}`)
  if (!res.ok) throw new Error(`Falha ao baixar ${file}: ${res.status}`)
  return res.json()
}

const [raw, formatted] = await Promise.all([
  loadJson(process.argv[2], 'items.json'),
  loadJson(process.argv[3], 'formatted/items.json'),
])

const ptNames = new Map(
  formatted
    .filter((i) => i.LocalizedNames?.['PT-BR'])
    .map((i) => [i.UniqueName, i.LocalizedNames['PT-BR'].trim()]),
)

const KINDS = ['weapon', 'transformationweapon', 'equipmentitem', 'mount', 'simpleitem', 'consumableitem']
const families = new Map()

for (const kind of KINDS) {
  for (const item of raw.items[kind] ?? []) {
    const id = item['@uniquename']
    const match = /^T(\d)_(.+)$/.exec(id)
    if (!match || id.includes('@')) continue
    if (item['@tradable'] === 'false' || item['@showinmarketplace'] === 'false') continue
    if (Number(item['@enchantmentlevel'] ?? 0) > 0) continue

    const group = classify(kind, item['@shopcategory'], item['@shopsubcategory1'])
    const name = ptNames.get(id)
    if (!group || !name) continue

    const tier = Number(match[1])
    const baseId = match[2]

    // Encantamentos disponíveis (recursos usam o formato _LEVELn@n)
    let maxEnchant = 0
    let leveled = false
    for (let e = 1; e <= 4; e++) {
      if (ptNames.has(`${id}@${e}`)) maxEnchant = e
      else if (ptNames.has(`${id}_LEVEL${e}@${e}`)) {
        maxEnchant = e
        leveled = true
      }
    }

    const family = families.get(baseId) ?? {
      id: baseId,
      group: group[0],
      category: group[1],
      tierNames: {},
      maxEnchant: 0,
      leveled: false,
      quality: Number(item['@maxqualitylevel'] ?? 1) > 1,
    }
    family.tierNames[tier] = name
    family.maxEnchant = Math.max(family.maxEnchant, maxEnchant)
    family.leveled ||= leveled
    families.set(baseId, family)
  }
}

const output = []
for (const f of families.values()) {
  const tiers = Object.keys(f.tierNames).map(Number).sort((a, b) => a - b)
  const stripped = Object.fromEntries(tiers.map((t) => [t, f.tierNames[t].replace(TIER_SUFFIX, '')]))

  // Nome base = o mais frequente entre os tiers (desempate pelo T4)
  const counts = new Map()
  for (const t of tiers) counts.set(stripped[t], (counts.get(stripped[t]) ?? 0) + 1)
  const preferred = stripped[tiers.includes(4) ? 4 : tiers[0]]
  const name = [...counts].sort((a, b) => b[1] - a[1] || (a[0] === preferred ? -1 : 1))[0][0]

  const entry = { id: f.id, name, group: f.group, category: f.category, tiers }

  // Guarda só os tiers cujo nome difere do base (ex: recursos, itens T8 com nome único)
  const tierNames = Object.fromEntries(tiers.filter((t) => stripped[t] !== name).map((t) => [t, stripped[t]]))
  if (Object.keys(tierNames).length) entry.tierNames = tierNames
  if (f.maxEnchant) entry.maxEnchant = f.maxEnchant
  if (f.leveled) entry.leveled = true
  if (f.quality) entry.quality = true
  output.push(entry)
}

output.sort((a, b) => a.group.localeCompare(b.group) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

await writeFile(OUTPUT, JSON.stringify(output) + '\n')
console.log(`${output.length} itens gravados em ${path.relative(process.cwd(), OUTPUT)}`)

// ==================== RECEITAS (calculadora de craft) ====================
//
// Formato de saída (compacto, carregado sob demanda pela calculadora):
// {
//   r: { [idDoProduto]: [quantidadeCraftada, valorDoItem, prataPorCraft, [[idIngrediente, qtd, retorna(0|1)], ...]] },
//   n: { [id]: nome }  // só para ids cujo nome não sai do catálogo (ingredientes extras, recursos encantados)
// }

const rawById = new Map()
for (const list of Object.values(raw.items)) {
  if (!Array.isArray(list)) continue
  for (const item of list) rawById.set(item['@uniquename'], item)
}

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

/** Primeira receita (as demais são alternativas, ex: token de favor no lugar do artefato) */
function firstRecipe(node) {
  return asArray(node?.craftingrequirements).find((r) => asArray(r.craftresource).length > 0)
}

function recipeFor(baseUnique, enchant) {
  if (enchant === 0) return firstRecipe(rawById.get(baseUnique))
  const leveled = rawById.get(`${baseUnique}_LEVEL${enchant}`)
  if (leveled) return firstRecipe(leveled)
  const level = asArray(rawById.get(baseUnique)?.enchantments?.enchantment).find(
    (e) => Number(e['@enchantmentlevel']) === enchant,
  )
  return firstRecipe(level)
}

/** Converte o nome do dump para o id usado pela API de mercado */
function marketId(unique, enchant) {
  return enchant > 0 ? `${unique}@${enchant}` : unique
}

// Valor do item (usado na taxa da estação): vem do dump ou é a soma dos ingredientes
const valueMemo = new Map()
function itemValue(unique, enchant) {
  const key = `${unique}#${enchant}`
  if (valueMemo.has(key)) return valueMemo.get(key)
  valueMemo.set(key, 0) // evita ciclos
  const own = rawById.get(enchant > 0 && !unique.includes('_LEVEL') ? `${unique}_LEVEL${enchant}` : unique)
  let value = Number(own?.['@itemvalue'] ?? 0)
  if (!value) {
    const base = unique.replace(/_LEVEL\d$/, '')
    const recipe = recipeFor(base, enchant)
    for (const res of asArray(recipe?.craftresource)) {
      value += itemValue(res['@uniquename'], Number(res['@enchantmentlevel'] ?? 0)) * Number(res['@count'])
    }
  }
  valueMemo.set(key, value)
  return value
}

const familiesById = new Map(output.map((f) => [f.id, f]))
const recipes = {}
const names = {}

function rememberName(id) {
  const parsed = /^T\d_(.+?)(?:_LEVEL\d)?(?:@\d)?$/.exec(id)
  const inCatalog = parsed && familiesById.has(parsed[1]) && !id.includes('_LEVEL')
  if (inCatalog || names[id]) return
  const name = ptNames.get(id) ?? ptNames.get(id.replace(/@\d$/, ''))
  if (name) names[id] = name.replace(TIER_SUFFIX, '')
}

for (const family of output) {
  if (family.group === 'Artefatos' || family.category === 'Recursos Brutos') continue
  for (const tier of family.tiers) {
    const baseUnique = `T${tier}_${family.id}`
    for (let enchant = 0; enchant <= (family.maxEnchant ?? 0); enchant++) {
      const recipe = recipeFor(baseUnique, enchant)
      const resources = asArray(recipe?.craftresource)
      if (!resources.length) continue

      const productUnique = family.leveled && enchant > 0 ? `${baseUnique}_LEVEL${enchant}` : baseUnique
      const productId = marketId(productUnique, enchant)
      const ingredients = resources.map((res) => {
        const id = marketId(res['@uniquename'], Number(res['@enchantmentlevel'] ?? 0))
        rememberName(id)
        return [id, Number(res['@count']), res['@maxreturnamount'] === '0' ? 0 : 1]
      })

      recipes[productId] = [
        Number(recipe['@amountcrafted'] ?? 1),
        itemValue(productUnique, enchant),
        Number(recipe['@silver'] ?? 0),
        ingredients,
      ]
      rememberName(productId)
    }
  }
}

const RECIPES_OUTPUT = path.join(path.dirname(OUTPUT), 'craft-recipes.json')
await writeFile(RECIPES_OUTPUT, JSON.stringify({ r: recipes, n: names }) + '\n')
console.log(`${Object.keys(recipes).length} receitas gravadas em ${path.relative(process.cwd(), RECIPES_OUTPUT)}`)
