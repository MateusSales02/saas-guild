<template>
  <div class="page">
    <RouterLink :to="{ name: 'builds' }" class="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200">
      <AppIcon name="arrow-left" :size="15" /> Voltar para builds
    </RouterLink>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else-if="!build || !data" class="space-y-4" aria-busy="true">
      <div class="panel flex gap-4 p-5"><div class="skeleton h-20 w-20" /><div class="flex-1 space-y-3"><div class="skeleton h-6 w-2/3" /><div class="skeleton h-4 w-1/2" /></div></div>
      <div class="panel skeleton h-96" />
    </div>

    <template v-else>
      <!-- CABEÇALHO -->
      <header class="panel flex flex-col gap-5 p-5 md:flex-row md:items-start">
        <span class="flex h-20 w-20 shrink-0 items-center justify-center">
          <ItemIcon v-if="weaponId" :item-id="weaponId" :size="80" :alt="itemName(weaponId)" eager />
          <span v-else class="inset flex h-20 w-20 items-center justify-center text-slate-600"><AppIcon name="swords" :size="28" /></span>
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span v-if="build.category" class="badge badge-gold">{{ build.category }}</span>
            <span v-if="build.status === 'draft'" class="badge badge-warning">Rascunho</span>
            <span v-if="!build.is_public" class="badge badge-neutral"><AppIcon name="lock" :size="10" /> Link privado</span>
          </div>
          <h1 class="page-title !mt-2">{{ build.name }}</h1>
          <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span>por <span class="font-medium text-slate-200">{{ buildAuthor(build) }}</span></span>
            <template v-if="weaponId">
              <span aria-hidden="true" class="text-slate-600">·</span>
              <RouterLink :to="{ name: 'builds', query: { arma: weaponId } }" class="link">Builds de {{ itemName(weaponId) }}</RouterLink>
            </template>
            <span aria-hidden="true" class="text-slate-600">·</span>
            <span>Atualizada em {{ formatDate(build.updated_at) }}</span>
          </p>
          <ul v-if="build.tags?.length" class="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
            <li v-for="tag in build.tags" :key="tag" class="chip !h-6 !cursor-default">{{ tag }}</li>
          </ul>
        </div>
        <div class="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          <button
            type="button"
            class="btn"
            :class="voted ? 'btn-primary' : 'btn-secondary'"
            :aria-pressed="voted"
            :disabled="voting || build.status === 'draft'"
            :title="build.status === 'draft' ? 'Publique a build para receber votos' : voted ? 'Remover voto' : 'Votar nesta build'"
            @click="toggleVote"
          >
            <AppIcon name="star" :size="16" />
            {{ voted ? 'Votada' : 'Votar' }}
            <span class="tabular-nums opacity-80">{{ build.vote_count ?? 0 }}</span>
          </button>
        </div>
      </header>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="min-w-0 space-y-4">
          <!-- EQUIPAMENTO E HABILIDADES -->
          <section class="panel" aria-labelledby="gear-title">
            <header class="panel-header">
              <h2 id="gear-title" class="section-title">Equipamento e habilidades</h2>
              <span class="inline-flex items-center gap-1.5 text-xs text-gold-300">★ Recomendado</span>
            </header>
            <p v-if="!gearRows.length" class="p-5 text-sm text-slate-500">Nenhum equipamento definido nesta build.</p>
            <ul v-else class="divide-y divide-white/[0.05]">
              <li v-for="row in gearRows" :key="row.slot" class="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <div class="flex min-w-0 items-center gap-3 sm:w-64 sm:shrink-0">
                  <ItemIcon :item-id="row.rec" :size="56" :alt="itemName(row.rec)" />
                  <div class="min-w-0">
                    <p class="text-[11px] font-semibold uppercase tracking-eyebrow text-slate-500">{{ row.label }}</p>
                    <p class="font-medium leading-snug text-slate-100">{{ itemName(row.rec) }}</p>
                    <p v-if="row.alt" class="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      Alternativa:
                      <ItemIcon :item-id="row.alt" :size="22" />
                      <span class="truncate text-slate-300">{{ itemName(row.alt) }}</span>
                    </p>
                  </div>
                </div>
                <div v-if="row.spells.length" class="flex flex-wrap gap-x-4 gap-y-3">
                  <div v-for="s in row.spells" :key="s.key" class="flex w-[4.5rem] flex-col items-center gap-1.5 text-center">
                    <SpellTile :spell-id="s.rec" :spell="data.spells[s.rec]" :hotkey="s.hotkey" :size="44" />
                    <span class="line-clamp-2 text-[11px] leading-tight text-slate-400">{{ data.spells[s.rec]?.n }}</span>
                    <span v-if="s.alt" class="flex flex-col items-center gap-1 border-t border-white/[0.05] pt-1.5">
                      <span class="text-[9px] uppercase tracking-wide text-slate-600">ou</span>
                      <SpellTile :spell-id="s.alt" :spell="data.spells[s.alt]" :size="30" muted />
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <!-- CARACTERÍSTICAS -->
          <section class="panel" aria-labelledby="traits-title">
            <header class="panel-header"><h2 id="traits-title" class="section-title">Características recomendadas</h2></header>
            <div class="p-5">
              <p v-if="!loadout.traits.length" class="text-sm text-slate-500">Nenhuma característica selecionada para esta build.</p>
              <ul v-else class="flex flex-wrap gap-2">
                <li v-for="id in loadout.traits" :key="id" class="inset flex items-center gap-2 py-1.5 pl-1.5 pr-3 text-sm text-slate-200">
                  <ItemIcon :item-id="id" kind="spell" :size="30" />
                  {{ data.traits.find((t) => t.id === id)?.n ?? id }}
                </li>
              </ul>
            </div>
          </section>

          <!-- CONSUMÍVEIS -->
          <section class="panel" aria-labelledby="consumables-title">
            <header class="panel-header"><h2 id="consumables-title" class="section-title">Consumíveis</h2></header>
            <div class="p-5">
              <p v-if="!consumableRows.length" class="text-sm text-slate-500">Nenhum consumível definido.</p>
              <div v-else class="grid gap-4 sm:grid-cols-2">
                <div v-for="row in consumableRows" :key="row.slot" class="space-y-2">
                  <p class="text-[11px] font-semibold uppercase tracking-eyebrow text-slate-500">{{ row.label }}</p>
                  <div class="flex items-center gap-3">
                    <ItemIcon :item-id="row.rec" :size="48" />
                    <span class="text-sm font-medium text-slate-100">{{ itemName(row.rec) }}</span>
                  </div>
                  <div v-if="row.alt" class="flex items-center gap-3 pl-1 text-xs text-slate-500">
                    <ItemIcon :item-id="row.alt" :size="32" />
                    <span>Alternativa: <span class="text-slate-300">{{ itemName(row.alt) }}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- DESCRIÇÃO -->
          <section v-if="build.description?.trim()" class="panel" aria-labelledby="desc-title">
            <header class="panel-header"><h2 id="desc-title" class="section-title">Guia</h2></header>
            <div class="build-markdown p-5" v-html="descriptionHtml" />
          </section>

          <!-- VÍDEOS -->
          <section v-if="build.videos?.length" class="panel" aria-labelledby="videos-title">
            <header class="panel-header"><h2 id="videos-title" class="section-title">Vídeos</h2></header>
            <div class="grid gap-4 p-5 xl:grid-cols-2">
              <div v-for="video in build.videos" :key="video" class="aspect-video overflow-hidden rounded-xl border border-white/[0.06] bg-black">
                <iframe
                  class="h-full w-full"
                  :src="`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video)}`"
                  :title="`Vídeo da build ${build.name}`"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
              </div>
            </div>
          </section>
        </div>

        <!-- LATERAL -->
        <aside class="space-y-4 lg:sticky lg:top-4">
          <section class="panel p-5" aria-labelledby="overview-title">
            <h2 id="overview-title" class="section-title mb-4">Visão geral</h2>
            <div class="flex justify-center">
              <BuildPreview :loadout="loadout" :data="data" :size="76" />
            </div>
            <div v-if="overviewSpells.length" class="mt-4 flex flex-wrap justify-center gap-2 border-t border-white/[0.05] pt-4">
              <SpellTile v-for="s in overviewSpells" :key="s.key" :spell-id="s.id" :spell="data.spells[s.id]" :hotkey="s.hotkey" :size="36" />
            </div>
          </section>

          <section v-if="priceIds.length" class="panel p-5" aria-labelledby="price-title">
            <h2 id="price-title" class="section-title">Custo estimado</h2>
            <p class="panel-subtitle">Itens recomendados · Caerleon · qualidade normal</p>
            <p v-if="pricing" class="mt-3 text-sm text-slate-500">Consultando preços…</p>
            <template v-else-if="price">
              <p class="mt-3 text-xl font-semibold tabular-nums text-gold-200">{{ formatSilver(price.total) }}</p>
              <p v-if="price.missing" class="mt-1 text-xs text-amber-300">{{ price.missing }} {{ price.missing === 1 ? 'item sem preço disponível' : 'itens sem preço disponível' }}</p>
            </template>
            <p v-else-if="priceError" class="mt-3 text-xs text-amber-300">{{ priceError }}</p>
          </section>

          <section class="panel space-y-2 p-5" aria-label="Ações">
            <button type="button" class="btn btn-secondary w-full" @click="copyLink">
              <AppIcon name="copy" :size="15" /> Copiar link
            </button>
            <RouterLink :to="{ name: 'builds.new', query: { clonar: build.id } }" class="btn btn-secondary w-full">
              <AppIcon name="plus" :size="15" /> Clonar build
            </RouterLink>
            <template v-if="canManage">
              <RouterLink :to="{ name: 'builds.edit', params: { id: build.id } }" class="btn btn-secondary w-full">
                <AppIcon name="edit" :size="15" /> Editar
              </RouterLink>
              <button type="button" class="btn btn-ghost w-full hover:!text-rose-300" @click="removeBuild">
                <AppIcon name="trash" :size="15" /> Remover
              </button>
            </template>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BuildPreview from '@/components/builds/BuildPreview.vue'
import SpellTile from '@/components/builds/SpellTile.vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { AlbionDataApi, BuildsApi } from '@/lib/api'
import {
  CONSUMABLE_SLOTS,
  GEAR_SLOTS,
  SPELL_GROUPS,
  buildAuthor,
  formatSilver,
  loadBuildData,
  normalizeLoadout,
  renderMarkdown,
  useBuildData,
  type BuildRecord,
  type Choice,
  type GearSlot,
} from '@/lib/builds'
import { friendlyError } from '@/lib/errors'
import { confirmAction, toast } from '@/lib/toast'
import { auth } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const data = useBuildData()

const build = ref<BuildRecord | null>(null)
const error = ref('')
const voted = ref(false)
const voting = ref(false)
const pricing = ref(false)
const price = ref<{ total: number; missing: number } | null>(null)
const priceError = ref('')

const loadout = computed(() => normalizeLoadout(build.value?.loadout))
const weaponId = computed(() => loadout.value.equipment.weapon.rec)

/** Autor, líderes e oficiais podem editar e remover */
const canManage = computed(() => {
  const userId = Number(auth.user?.id)
  const role = String(auth.user?.role ?? '').toLowerCase()
  return !build.value?.author || build.value.author.id === userId || ['admin', 'leader', 'officer'].includes(role)
})

const gearRows = computed(() =>
  GEAR_SLOTS.flatMap((slot) => {
    const choice = loadout.value.equipment[slot.key]
    if (!choice.rec) return []
    return [{ slot: slot.key, label: slot.label, rec: choice.rec, alt: choice.alt, spells: spellsFor(slot.key, choice.rec) }]
  }),
)

const consumableRows = computed(() =>
  CONSUMABLE_SLOTS.flatMap((slot) => {
    const choice = loadout.value.consumables[slot.key]
    return choice.rec ? [{ slot: slot.key, label: slot.label, rec: choice.rec, alt: choice.alt }] : []
  }),
)

/** Habilidades escolhidas; itens sem escolha (capa, mão secundária) mostram a passiva fixa */
function spellsFor(slot: GearSlot, itemId: string) {
  const group = SPELL_GROUPS.find((g) => g.slot === slot)
  if (group) {
    const chosen = loadout.value.spells as unknown as Record<GearSlot, Record<string, Choice>>
    return group.keys.flatMap((k) => {
      const c = chosen[slot][k.key]
      return c?.rec ? [{ key: k.key, hotkey: k.hotkey, rec: c.rec, alt: c.alt }] : []
    })
  }
  return (data.value?.items[itemId]?.sp?.p ?? []).map((id) => ({ key: id, hotkey: 'P', rec: id, alt: null as string | null }))
}

const overviewSpells = computed(() =>
  gearRows.value.flatMap((row) => row.spells.map((s) => ({ key: `${row.slot}-${s.key}`, id: s.rec, hotkey: s.hotkey }))),
)

const descriptionHtml = computed(() => renderMarkdown(build.value?.description ?? '', data.value))

const priceIds = computed(() =>
  [...Object.values(loadout.value.equipment), ...Object.values(loadout.value.consumables)]
    .map((c) => c.rec)
    .filter((id): id is string => !!id),
)

function itemName(id: string) {
  return data.value?.items[id]?.n ?? id
}

async function load() {
  error.value = ''
  build.value = null
  try {
    const id = Number(route.params.id)
    const [record] = await Promise.all([BuildsApi.get(id), loadBuildData()])
    build.value = record
    void fetchPrice()
    BuildsApi.myVotes()
      .then((ids) => (voted.value = ids.includes(id)))
      .catch(() => {})
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar a build.')
  }
}

async function fetchPrice() {
  const ids = [...new Set(priceIds.value)]
  if (!ids.length) return
  pricing.value = true
  price.value = null
  priceError.value = ''
  try {
    const prices = await AlbionDataApi.getPrices(ids, ['Caerleon'], [1])
    const byId = new Map(prices.filter((p) => p.sell_price_min > 0).map((p) => [p.item_id, p.sell_price_min]))
    // Cada espaço conta uma vez, mesmo que o mesmo item apareça em dois
    const total = priceIds.value.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0)
    const missing = priceIds.value.filter((id) => !byId.has(id)).length
    if (!total) priceError.value = 'Nenhum preço disponível no momento.'
    else price.value = { total, missing }
  } catch (e) {
    priceError.value = friendlyError(e, 'Não foi possível consultar os preços.')
  } finally {
    pricing.value = false
  }
}

async function toggleVote() {
  if (!build.value) return
  voting.value = true
  try {
    const result = await BuildsApi.vote(build.value.id)
    voted.value = result.voted
    build.value.vote_count = result.vote_count
  } catch (e) {
    toast('Não foi possível votar', { tone: 'error', text: friendlyError(e) })
  } finally {
    voting.value = false
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    toast('Link copiado')
  } catch {
    toast('Não foi possível copiar', { tone: 'error', text: window.location.href })
  }
}

async function removeBuild() {
  if (!build.value) return
  const ok = await confirmAction({
    title: `Remover a build "${build.value.name}"?`,
    text: 'Essa ação não pode ser desfeita.',
    confirmLabel: 'Remover',
    danger: true,
  })
  if (!ok) return
  try {
    await BuildsApi.remove(build.value.id)
    toast('Build removida')
    await router.push({ name: 'builds' })
  } catch (e) {
    toast('Não foi possível remover', { tone: 'error', text: friendlyError(e) })
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}

watch(
  () => route.params.id,
  () => {
    if (route.name === 'builds.detail') void load()
  },
  { immediate: true },
)
</script>
