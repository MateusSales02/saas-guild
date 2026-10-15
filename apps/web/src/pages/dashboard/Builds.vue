<template>
  <div class="page">
    <PageHeader
      :eyebrow="guild?.name ?? 'Guilda'"
      title="Builds"
      subtitle="Descubra as builds da guilda e da comunidade. Filtre por arma, tipo de conteúdo e mais."
    >
      <template #actions>
        <RouterLink :to="{ name: 'builds.new' }" class="btn btn-primary">
          <AppIcon name="plus" :size="16" />
          Criar build
        </RouterLink>
      </template>
    </PageHeader>

    <!-- Abas -->
    <div class="flex gap-1 border-b border-white/[0.06]" role="tablist" aria-label="Listas de builds">
      <button
        v-for="t in TABS"
        :key="t.value"
        type="button"
        role="tab"
        :aria-selected="tab === t.value"
        class="-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors"
        :class="tab === t.value ? 'border-gold-400 text-gold-100' : 'border-transparent text-slate-400 hover:text-slate-200'"
        @click="tab = t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Árvore de armas -->
    <section class="panel p-4" aria-labelledby="weapon-tree-title">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="weapon-tree-title" class="section-title">Árvore de armas</h2>
        <p class="text-xs text-slate-500">
          <template v-if="weaponType">
            Mostrando <span class="text-gold-200">{{ weaponType }}</span> ·
            <button type="button" class="underline-offset-2 hover:text-slate-300 hover:underline" @click="weaponType = ''">ver todas</button>
          </template>
          <template v-else>Escolha um tipo de arma para filtrar</template>
        </p>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Tipo de arma">
        <button
          v-for="w in WEAPON_TREE"
          :key="w.category"
          type="button"
          class="inset flex h-14 w-14 shrink-0 items-center justify-center transition-colors hover:border-white/20"
          :class="{ '!border-gold-500/60 !bg-gold-500/[0.08]': weaponType === w.category }"
          :title="w.category"
          :aria-label="w.category"
          :aria-pressed="weaponType === w.category"
          @click="weaponType = weaponType === w.category ? '' : w.category"
        >
          <ItemIcon :item-id="w.icon" :size="48" />
        </button>
      </div>
    </section>

    <!-- Filtros -->
    <div class="panel grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto] xl:items-end">
      <div>
        <label class="label" for="filter-weapon">Buscar por arma</label>
        <GamePicker
          v-model="weaponId"
          input-id="filter-weapon"
          :options="weaponOptions"
          :show-icon="false"
          grouped
          placeholder="Todas as armas"
        />
      </div>
      <div>
        <label class="label" for="filter-category">Tipo de conteúdo</label>
        <select id="filter-category" v-model="category" class="select">
          <option value="">Todos</option>
          <option v-for="c in BUILD_CATEGORIES" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="label" for="filter-sort">Ordenar por</label>
        <select id="filter-sort" v-model="sort" class="select">
          <option value="popular">Popularidade</option>
          <option value="recent">Atualizadas recentemente</option>
          <option value="name">Nome</option>
        </select>
      </div>
      <div>
        <label class="label" for="filter-author">Autor</label>
        <input id="filter-author" v-model="author" type="search" class="input" placeholder="Nome do autor" />
      </div>
      <div class="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-1 xl:flex-col xl:items-stretch xl:gap-2">
        <label class="check whitespace-nowrap text-xs">
          <input v-model="showEquipment" type="checkbox" />
          Mostrar equipamento
        </label>
        <button type="button" class="btn btn-ghost btn-sm" :disabled="!hasFilters" @click="resetFilters">
          <AppIcon name="refresh" :size="14" /> Limpar filtros
        </button>
      </div>
    </div>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="fetchBuilds">Tentar novamente</button>
    </div>

    <!-- Lista -->
    <div v-if="loading" class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      <div v-for="i in 6" :key="i" class="panel space-y-3 p-4">
        <div class="skeleton h-4 w-28" />
        <div class="flex gap-3"><div class="skeleton h-14 w-14" /><div class="skeleton h-4 flex-1" /></div>
        <div class="flex gap-2"><div v-for="j in 6" :key="j" class="skeleton h-10 w-10" /></div>
      </div>
    </div>

    <div v-else-if="visibleBuilds.length === 0" class="panel">
      <EmptyState icon="hammer" :title="emptyState.title" :text="emptyState.text">
        <button v-if="hasFilters && builds.length" type="button" class="btn btn-secondary btn-sm" @click="resetFilters">Limpar filtros</button>
        <RouterLink v-else-if="tab !== 'voted'" :to="{ name: 'builds.new' }" class="btn btn-secondary btn-sm">
          <AppIcon name="plus" :size="14" /> Criar build
        </RouterLink>
      </EmptyState>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      <RouterLink
        v-for="build in visibleBuilds"
        :key="build.id"
        :to="{ name: 'builds.detail', params: { id: build.id } }"
        class="panel group flex flex-col gap-3 p-4 transition-colors hover:border-gold-500/30"
      >
        <div class="flex items-center gap-2 text-xs">
          <span class="badge badge-gold truncate">{{ build.category || 'Sem categoria' }}</span>
          <span v-if="build.status === 'draft'" class="badge badge-warning">Rascunho</span>
          <span v-if="!build.is_public" class="badge badge-neutral"><AppIcon name="lock" :size="10" /> Privada</span>
          <span
            class="ml-auto inline-flex items-center gap-1 tabular-nums"
            :class="votedIds.has(build.id) ? 'text-gold-300' : 'text-slate-500'"
            :title="`${build.vote_count ?? 0} votos`"
          >
            <AppIcon name="star" :size="13" /> {{ build.vote_count ?? 0 }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <ItemIcon v-if="build.view.equipment.weapon.rec" :item-id="build.view.equipment.weapon.rec" :size="56" />
            <span v-else class="inset flex h-14 w-14 items-center justify-center text-slate-600"><AppIcon name="swords" :size="20" /></span>
            <span v-if="build.view.equipment.offhand.rec" class="absolute -bottom-1 -right-2 rounded-lg bg-ink-900">
              <ItemIcon :item-id="build.view.equipment.offhand.rec" :size="30" />
            </span>
          </span>
          <div class="min-w-0">
            <h3 class="line-clamp-2 font-semibold leading-snug text-slate-50 group-hover:text-gold-100">{{ build.name }}</h3>
            <p class="mt-0.5 truncate text-xs text-slate-500">
              por {{ buildAuthor(build) }} · {{ formatDate(build.updated_at) }}
            </p>
          </div>
        </div>

        <div v-if="showEquipment" class="mt-auto flex flex-wrap items-center gap-1.5 border-t border-white/[0.05] pt-3">
          <template v-for="slot in CARD_SLOTS" :key="slot.key">
            <span
              v-if="slotId(build, slot.key)"
              class="inset flex h-10 w-10 items-center justify-center"
              :title="`${slot.label}: ${data?.items[slotId(build, slot.key)!]?.n ?? ''}`"
            >
              <ItemIcon :item-id="slotId(build, slot.key)!" :size="36" />
            </span>
          </template>
          <span v-if="!CARD_SLOTS.some((s) => slotId(build, s.key))" class="text-xs text-slate-600">Sem equipamento definido</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import GamePicker from '@/components/builds/GamePicker.vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { BuildsApi, type BuildFilters } from '@/lib/api'
import {
  BUILD_CATEGORIES,
  WEAPON_TREE,
  buildAuthor,
  normalizeLoadout,
  useBuildData,
  type BuildRecord,
  type Loadout,
  type PickerOption,
} from '@/lib/builds'
import { friendlyError } from '@/lib/errors'
import { normalizeText } from '@/lib/market'
import { auth } from '@/stores/auth'

type Tab = 'all' | 'mine' | 'voted'
type ViewBuild = BuildRecord & { view: Loadout }

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'mine', label: 'Criadas por mim' },
  { value: 'voted', label: 'Votadas' },
]

const CARD_SLOTS = [
  { key: 'head', label: 'Cabeça' },
  { key: 'armor', label: 'Peitoral' },
  { key: 'shoes', label: 'Botas' },
  { key: 'cape', label: 'Capa' },
  { key: 'potion', label: 'Poção' },
  { key: 'food', label: 'Comida' },
] as const

const SHOW_EQUIPMENT_KEY = 'builds.showEquipment'

const route = useRoute()
const data = useBuildData()
const guild = computed(() => auth.guild)

const tab = ref<Tab>('all')
const weaponType = ref('')
// "Builds de <arma>" na página da build chega aqui com ?arma=ID
const weaponId = ref<string | null>(typeof route.query.arma === 'string' ? route.query.arma : null)
const category = ref('')
const sort = ref<NonNullable<BuildFilters['sort']>>('popular')
const author = ref('')
const showEquipment = ref(readShowEquipment())

const builds = ref<ViewBuild[]>([])
const votedIds = ref(new Set<number>())
const loading = ref(true)
const error = ref('')

const weaponOptions = computed<PickerOption[]>(() =>
  Object.entries(data.value?.items ?? {})
    .filter(([, item]) => item.s === 'weapon')
    .map(([id, item]) => ({ id, name: item.n, group: item.c })),
)

const hasFilters = computed(() => !!(weaponType.value || weaponId.value || category.value || author.value.trim()))

const visibleBuilds = computed(() => {
  const authorQuery = normalizeText(author.value)
  return builds.value.filter((build) => {
    const weapon = build.view.equipment.weapon.rec
    if (weaponId.value && weapon !== weaponId.value) return false
    if (weaponType.value && (!weapon || data.value?.items[weapon]?.c !== weaponType.value)) return false
    if (authorQuery && !normalizeText(buildAuthor(build)).includes(authorQuery)) return false
    return true
  })
})

const emptyState = computed(() => {
  if (builds.value.length && hasFilters.value)
    return { title: 'Nenhuma build com esses filtros', text: 'Limpe os filtros para ver todas as builds.' }
  if (tab.value === 'voted')
    return { title: 'Você ainda não votou em nenhuma build', text: 'Navegue pelas builds e vote nas melhores para salvá-las aqui.' }
  if (tab.value === 'mine')
    return { title: 'Você ainda não criou nenhuma build', text: 'Monte sua primeira build e compartilhe com a guilda.' }
  return { title: 'Nenhuma build encontrada', text: 'Monte a primeira build e compartilhe com a guilda.' }
})

function slotId(build: ViewBuild, key: (typeof CARD_SLOTS)[number]['key']): string | null {
  return key === 'potion' || key === 'food' ? build.view.consumables[key].rec : build.view.equipment[key].rec
}

async function fetchBuilds() {
  loading.value = true
  error.value = ''
  try {
    const params: BuildFilters = { sort: sort.value }
    if (category.value) params.category = category.value
    const userId = Number(auth.user?.id)
    if (tab.value === 'mine') params.authorId = userId
    else if (tab.value === 'voted') params.voterId = userId
    else if (guild.value?.id) params.guildId = guild.value.id

    const list: BuildRecord[] = (await BuildsApi.list(params)) ?? []
    builds.value = list.map((b) => ({ ...b, view: normalizeLoadout(b.loadout) }))
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar as builds.')
  } finally {
    loading.value = false
  }
}

async function fetchVotes() {
  try {
    votedIds.value = new Set(await BuildsApi.myVotes())
  } catch {
    // Sem votos: os cards só não destacam a estrela
  }
}

function resetFilters() {
  weaponType.value = ''
  weaponId.value = null
  category.value = ''
  author.value = ''
}

function readShowEquipment(): boolean {
  try {
    return localStorage.getItem(SHOW_EQUIPMENT_KEY) !== '0'
  } catch {
    return true
  }
}

watch(showEquipment, (value) => {
  try {
    localStorage.setItem(SHOW_EQUIPMENT_KEY, value ? '1' : '0')
  } catch {
    // Preferência só não fica salva
  }
})

watch([tab, category, sort], fetchBuilds)

onMounted(() => {
  void fetchBuilds()
  void fetchVotes()
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}
</script>
