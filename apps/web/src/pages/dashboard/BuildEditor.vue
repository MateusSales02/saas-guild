<template>
  <div class="page">
    <RouterLink :to="backTo" class="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200">
      <AppIcon name="arrow-left" :size="15" /> {{ editingId ? 'Voltar para a build' : 'Voltar para builds' }}
    </RouterLink>

    <PageHeader
      :eyebrow="guild?.name ?? 'Guilda'"
      :title="editingId ? 'Editar build' : 'Criar nova build'"
      subtitle="Compartilhe sua build com a guilda e a comunidade de Albion Online."
    />

    <div v-if="loadError" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ loadError }}</p>
      <RouterLink :to="{ name: 'builds' }" class="btn btn-secondary btn-sm">Ver builds</RouterLink>
    </div>

    <div v-else-if="loadingBuild || !data" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="panel space-y-3 p-5">
          <div class="skeleton h-5 w-40" />
          <div class="skeleton h-10" />
          <div class="skeleton h-10" />
        </div>
      </div>
      <div class="panel skeleton h-80" />
    </div>

    <form v-else class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" novalidate @submit.prevent="save('published')">
      <div class="min-w-0 space-y-4">
        <!-- INFORMAÇÕES BÁSICAS -->
        <CollapsePanel title="Informações básicas">
          <div class="space-y-5">
            <div>
              <label for="build-title" class="label">Título da build</label>
              <input id="build-title" v-model="form.name" maxlength="60" class="input" required />
              <p class="mt-1.5 text-xs text-slate-500">Exemplo: Maça Íncubo Tanque para Fama em Grupo</p>
            </div>

            <div>
              <label for="build-category" class="label">Tipo de conteúdo</label>
              <select id="build-category" v-model="form.category" class="select">
                <option value="">Selecione</option>
                <option v-for="c in BUILD_CATEGORIES" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div>
              <label for="build-tags" class="label">Tags</label>
              <div class="input flex min-h-10 flex-wrap items-center gap-1.5 !py-1.5" @click="tagInput?.focus()">
                <span v-for="tag in form.tags" :key="tag" class="badge badge-neutral gap-1">
                  {{ tag }}
                  <button type="button" class="text-slate-400 hover:text-slate-100" :aria-label="`Remover tag ${tag}`" @click.stop="removeTag(tag)">
                    <AppIcon name="x" :size="11" />
                  </button>
                </span>
                <input
                  id="build-tags"
                  ref="tagInput"
                  v-model="tagDraft"
                  class="min-w-[8rem] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  :placeholder="form.tags.length >= 10 ? 'Limite de 10 tags' : form.tags.length ? '' : 'Ex: PvE, Masmorra, Iniciante'"
                  :disabled="form.tags.length >= 10"
                  maxlength="30"
                  @keydown.enter.prevent="addTag"
                  @keydown="onTagKey"
                  @blur="addTag"
                />
              </div>
              <p class="mt-1.5 text-xs text-slate-500">Pressione Enter ou vírgula para adicionar.</p>
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between gap-2">
                <label for="build-desc" class="label !mb-0">Descrição</label>
                <button type="button" class="btn btn-ghost btn-sm" :aria-pressed="previewDescription" @click="previewDescription = !previewDescription">
                  <AppIcon :name="previewDescription ? 'edit' : 'eye'" :size="14" />
                  {{ previewDescription ? 'Editar' : 'Pré-visualizar' }}
                </button>
              </div>
              <div
                v-if="previewDescription"
                class="build-markdown inset min-h-40 p-4"
                v-html="form.description.trim() ? renderMarkdown(form.description, data) : '<p class=\'text-slate-500\'>Nada para pré-visualizar ainda.</p>'"
              />
              <textarea
                v-else
                id="build-desc"
                ref="descriptionInput"
                v-model="form.description"
                rows="8"
                maxlength="10000"
                class="textarea font-mono text-[13px]"
                placeholder="Explique quando usar a build, a rotação de habilidades, dicas de posicionamento..."
              />
              <p class="mt-1.5 text-xs text-slate-500">Use Markdown e adicione ícones de itens e habilidades ao texto.</p>

              <details class="inset mt-3 px-4 py-3 text-sm text-slate-300">
                <summary class="cursor-pointer select-none font-medium text-slate-200">Ajuda de formatação: itens, habilidades e Markdown</summary>
                <div class="mt-3 space-y-3 text-xs leading-relaxed text-slate-400">
                  <ul class="grid gap-1 sm:grid-cols-2">
                    <li><code class="text-gold-200"># Título</code> · <code class="text-gold-200">## Subtítulo</code></li>
                    <li><code class="text-gold-200">**negrito**</code> · <code class="text-gold-200">*itálico*</code></li>
                    <li><code class="text-gold-200">- item de lista</code> · <code class="text-gold-200">1. passo</code></li>
                    <li><code class="text-gold-200">[texto](https://link)</code></li>
                    <li><code class="text-gold-200">[item:T8_MAIN_SWORD]</code> mostra o ícone do item</li>
                    <li><code class="text-gold-200">[habilidade:MIGHTYBLOW]</code> mostra a habilidade</li>
                  </ul>
                  <div v-if="insertables.length">
                    <p class="mb-1.5 text-slate-300">Clique para inserir um ícone desta build no texto:</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="token in insertables"
                        :key="token.token"
                        type="button"
                        class="inset flex items-center gap-1.5 py-1 pl-1 pr-2 text-xs text-slate-300 transition-colors hover:border-gold-500/40"
                        @click="insertToken(token.token)"
                      >
                        <ItemIcon :item-id="token.id" :kind="token.kind" :size="20" />
                        {{ token.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label for="build-author" class="label">Autor</label>
                <input id="build-author" v-model="form.author_name" maxlength="15" class="input" placeholder="Seu nome" />
                <p class="mt-1.5 text-xs text-slate-500">{{ form.author_name.length }}/15 caracteres</p>
              </div>
              <div>
                <label for="build-videos" class="label">Vídeo(s) do YouTube</label>
                <input id="build-videos" v-model="form.videos" class="input" placeholder="KmFHDQd3M5w, NRQg_Ha4kXc" />
                <p class="mt-1.5 text-xs text-slate-500">
                  IDs ou links separados por vírgula
                  <template v-if="videoIds.length"> · {{ videoIds.length }} {{ videoIds.length === 1 ? 'vídeo válido' : 'vídeos válidos' }}</template>
                </p>
              </div>
            </div>
          </div>
        </CollapsePanel>

        <!-- EQUIPAMENTO -->
        <CollapsePanel title="Equipamento">
          <ColumnHeads />
          <div class="space-y-5">
            <ChoiceRow
              v-for="slot in GEAR_SLOTS"
              :key="slot.key"
              v-model:rec="form.loadout.equipment[slot.key].rec"
              v-model:alt="form.loadout.equipment[slot.key].alt"
              :label="slot.label"
              :options="itemOptions[slot.key]"
              :placeholder="slot.placeholder"
              :disabled="slot.key === 'offhand' && twoHanded"
              disabled-text="Arma de duas mãos: sem mão secundária"
              grouped
            />
          </div>
        </CollapsePanel>

        <!-- CONSUMÍVEIS -->
        <CollapsePanel title="Consumíveis">
          <ColumnHeads />
          <div class="space-y-5">
            <ChoiceRow
              v-for="slot in CONSUMABLE_SLOTS"
              :key="slot.key"
              v-model:rec="form.loadout.consumables[slot.key].rec"
              v-model:alt="form.loadout.consumables[slot.key].alt"
              :label="slot.label"
              :options="itemOptions[slot.key]"
              :placeholder="slot.placeholder"
            />
          </div>
        </CollapsePanel>

        <!-- HABILIDADES -->
        <CollapsePanel title="Habilidades">
          <ColumnHeads />
          <div class="space-y-8">
            <div v-for="group in SPELL_GROUPS" :key="group.slot">
              <h3 class="mb-3 text-sm font-semibold text-slate-100">{{ group.label }}</h3>
              <div class="space-y-4">
                <ChoiceRow
                  v-for="k in group.keys"
                  :key="k.key"
                  v-model:rec="spellChoice(group.slot, k.key).rec"
                  v-model:alt="spellChoice(group.slot, k.key).alt"
                  :label="k.label"
                  :hotkey="k.hotkey"
                  kind="spell"
                  :options="spellOptions(group.slot, k.key)"
                  placeholder="Selecione a habilidade"
                  :disabled="!spellOptions(group.slot, k.key).length"
                  :disabled-text="form.loadout.equipment[group.slot].rec ? 'Sem opções para este item' : `Selecione ${SLOT_ARTICLE[group.slot]} primeiro`"
                />
              </div>
            </div>
          </div>
        </CollapsePanel>

        <!-- CARACTERÍSTICAS -->
        <CollapsePanel title="Características recomendadas">
          <p class="label">Características recomendadas <span class="font-normal text-slate-500">(opcional · máx. 3)</span></p>
          <p class="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
            <AppIcon name="info" :size="13" /> Escolha até 3 características de arma despertada para esta build.
          </p>
          <ul v-if="form.loadout.traits.length" class="mb-3 flex flex-wrap gap-2">
            <li v-for="id in form.loadout.traits" :key="id" class="inset flex items-center gap-2 py-1 pl-1 pr-2 text-sm text-slate-200">
              <ItemIcon :item-id="id" kind="spell" :size="28" />
              {{ traitName(id) }}
              <button type="button" class="ml-1 text-slate-500 hover:text-slate-100" :aria-label="`Remover ${traitName(id)}`" @click="removeTrait(id)">
                <AppIcon name="x" :size="13" />
              </button>
            </li>
          </ul>
          <GamePicker
            :model-value="null"
            :options="traitOptions"
            kind="spell"
            label="Buscar características"
            :disabled="form.loadout.traits.length >= 3"
            :placeholder="form.loadout.traits.length >= 3 ? 'Limite de 3 características' : 'Buscar características...'"
            @update:model-value="addTrait"
          />
        </CollapsePanel>
      </div>

      <!-- LATERAL -->
      <aside class="space-y-4 lg:sticky lg:top-4">
        <section class="panel p-5" aria-labelledby="preview-title">
          <h2 id="preview-title" class="section-title mb-4">Pré-visualização</h2>
          <div class="flex justify-center">
            <BuildPreview :loadout="form.loadout" :data="data" :size="76" />
          </div>
          <div v-if="previewSpells.length" class="mt-4 flex flex-wrap justify-center gap-2 border-t border-white/[0.05] pt-4">
            <SpellTile v-for="s in previewSpells" :key="s.key" :spell-id="s.id" :spell="data.spells[s.id]" :hotkey="s.hotkey" :size="36" />
          </div>
        </section>

        <section class="panel p-5" aria-labelledby="checklist-title">
          <h2 id="checklist-title" class="section-title mb-3">Antes de publicar</h2>
          <div class="space-y-2.5 text-sm">
            <label class="check items-start">
              <input v-model="checklist.language" type="checkbox" />
              O guia está escrito em português
            </label>
            <label class="check items-start">
              <input v-model="checklist.formatted" type="checkbox" />
              O guia está formatado corretamente
            </label>
            <label class="check items-start">
              <input v-model="checklist.guidelines" type="checkbox" />
              <span>
                Li e segui as
                <button type="button" class="font-medium text-gold-300 underline underline-offset-2 hover:text-gold-200" :aria-expanded="showGuidelines" @click.prevent="showGuidelines = !showGuidelines">diretrizes de criação de builds</button>
              </span>
            </label>
          </div>
          <ul v-if="showGuidelines" class="mt-3 list-disc space-y-1 rounded-xl bg-white/[0.02] py-3 pl-8 pr-3 text-xs leading-relaxed text-slate-400">
            <li>Dê um título claro: arma, função e conteúdo.</li>
            <li>Escolha o tipo de conteúdo certo para a build.</li>
            <li>Explique a rotação de habilidades e quando usar cada uma.</li>
            <li>Indique alternativas mais baratas quando fizer sentido.</li>
            <li>Nada de ofensas, spam ou propaganda.</li>
          </ul>
        </section>

        <section class="panel p-5" aria-labelledby="visibility-title">
          <h2 id="visibility-title" class="section-title mb-3">Visibilidade</h2>
          <label class="check items-start text-sm">
            <input v-model="form.privateLink" type="checkbox" />
            <span>
              Link privado
              <span class="mt-0.5 block text-xs text-slate-500">Só a sua guilda e quem tiver o link podem ver. Não aparece na listagem pública.</span>
            </span>
          </label>
        </section>

        <div v-if="publishBlockers.length && attemptedPublish" role="alert" class="alert alert-warning text-sm">
          <AppIcon name="alert" :size="16" class="mt-0.5" />
          <div>
            <p class="font-medium">Para publicar, falta:</p>
            <ul class="mt-1 list-disc pl-4 text-xs">
              <li v-for="b in publishBlockers" :key="b">{{ b }}</li>
            </ul>
          </div>
        </div>
        <p v-if="saveError" role="alert" class="alert alert-error text-sm">{{ saveError }}</p>

        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-ghost" :disabled="saving" @click="resetForm">Resetar</button>
          <button type="button" class="btn btn-secondary flex-1" :disabled="saving || !form.name.trim()" @click="save('draft')">
            Salvar rascunho
          </button>
          <button type="submit" class="btn btn-primary w-full" :disabled="saving">
            <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
            {{ isPublished ? 'Salvar e publicar' : 'Publicar build' }}
          </button>
        </div>
      </aside>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink, useRoute, useRouter } from 'vue-router'
import BuildPreview from '@/components/builds/BuildPreview.vue'
import ChoiceRow from '@/components/builds/ChoiceRow.vue'
import CollapsePanel from '@/components/builds/CollapsePanel.vue'
import GamePicker from '@/components/builds/GamePicker.vue'
import SpellTile from '@/components/builds/SpellTile.vue'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { BuildsApi, type BuildPayload } from '@/lib/api'
import {
  BUILD_CATEGORIES,
  CONSUMABLE_SLOTS,
  GEAR_SLOTS,
  SPELL_GROUPS,
  emptyLoadout,
  normalizeLoadout,
  parseVideoIds,
  renderMarkdown,
  useBuildData,
  type BuildRecord,
  type Choice,
  type GearSlot,
  type ItemSlot,
  type PickerOption,
  type SpellKey,
} from '@/lib/builds'
import { friendlyError } from '@/lib/errors'
import { confirmAction, toast } from '@/lib/toast'
import { auth } from '@/stores/auth'

/** Cabeçalho das colunas "Recomendado" e "Alternativa" */
const ColumnHeads = defineComponent(() => () =>
  h('div', { class: 'mb-4 hidden grid-cols-2 gap-x-6 text-sm font-medium md:grid', 'aria-hidden': 'true' }, [
    h('span', { class: 'inline-flex items-center gap-1.5 text-gold-300' }, ['★ Recomendado']),
    h('span', { class: 'text-slate-500' }, 'Alternativa'),
  ]),
)

const SLOT_ARTICLE: Record<GearSlot, string> = {
  weapon: 'a arma',
  offhand: 'a mão secundária',
  head: 'o capacete',
  armor: 'a armadura',
  shoes: 'as botas',
  cape: 'a capa',
}

const route = useRoute()
const router = useRouter()
const data = useBuildData()
const guild = computed(() => auth.guild)

const editingId = computed(() => (route.name === 'builds.edit' ? Number(route.params.id) : null))
const backTo = computed(() => (editingId.value ? { name: 'builds.detail', params: { id: editingId.value } } : { name: 'builds' }))

const emptyForm = () => ({
  name: '',
  category: '',
  tags: [] as string[],
  description: '',
  author_name: String(auth.user?.nickname ?? '').slice(0, 15),
  videos: '',
  privateLink: false,
  loadout: emptyLoadout(),
})

const form = reactive(emptyForm())
const checklist = reactive({ language: false, formatted: false, guidelines: false })
const original = ref(JSON.stringify(form))
const loadedStatus = ref<'draft' | 'published' | null>(null)

const loadingBuild = ref(false)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')
const attemptedPublish = ref(false)
const previewDescription = ref(false)
const showGuidelines = ref(false)
const tagDraft = ref('')
const tagInput = ref<HTMLInputElement | null>(null)
const descriptionInput = ref<HTMLTextAreaElement | null>(null)

const isPublished = computed(() => loadedStatus.value === 'published')
const videoIds = computed(() => parseVideoIds(form.videos))
const dirty = computed(() => JSON.stringify(form) !== original.value)

// ---------- Opções ----------

const itemOptions = computed(() => {
  const bySlot: Record<ItemSlot, PickerOption[]> = { weapon: [], offhand: [], head: [], armor: [], shoes: [], cape: [], potion: [], food: [] }
  for (const [id, item] of Object.entries(data.value?.items ?? {})) {
    bySlot[item.s].push({ id, name: item.n, group: item.c })
  }
  return bySlot
})

const twoHanded = computed(() => {
  const weapon = form.loadout.equipment.weapon.rec
  return !!(weapon && data.value?.items[weapon]?.h)
})

function spellOptions(slot: GearSlot, key: SpellKey): PickerOption[] {
  const itemId = form.loadout.equipment[slot].rec
  const ids = (itemId && data.value?.items[itemId]?.sp?.[key]) || []
  return ids.map((id) => ({ id, name: data.value?.spells[id]?.n ?? id }))
}

function spellChoice(slot: GearSlot, key: SpellKey): Choice {
  return (form.loadout.spells as unknown as Record<GearSlot, Record<string, Choice>>)[slot][key]
}

const traitOptions = computed<PickerOption[]>(() =>
  (data.value?.traits ?? []).filter((t) => !form.loadout.traits.includes(t.id)).map((t) => ({ id: t.id, name: t.n })),
)

function traitName(id: string) {
  return data.value?.traits.find((t) => t.id === id)?.n ?? id
}

// Ao trocar o item, descarta habilidades que ele não tem e preenche as que só têm uma opção
watch(
  () => SPELL_GROUPS.map((g) => form.loadout.equipment[g.slot].rec).join('|') + (data.value ? '' : '…'),
  () => {
    if (!data.value) return
    for (const group of SPELL_GROUPS) {
      for (const { key } of group.keys) {
        const valid = spellOptions(group.slot, key).map((o) => o.id)
        const c = spellChoice(group.slot, key)
        if (c.rec && !valid.includes(c.rec)) c.rec = null
        if (c.alt && !valid.includes(c.alt)) c.alt = null
        if (!c.rec && valid.length === 1) c.rec = valid[0]
      }
    }
  },
)

watch(twoHanded, (value) => {
  if (value) form.loadout.equipment.offhand = { rec: null, alt: null }
})

// ---------- Pré-visualização ----------

const previewSpells = computed(() => {
  const list: { key: string; id: string; hotkey: string }[] = []
  for (const group of SPELL_GROUPS) {
    for (const k of group.keys) {
      const id = spellChoice(group.slot, k.key).rec
      if (id) list.push({ key: `${group.slot}-${k.key}`, id, hotkey: k.hotkey })
    }
  }
  return list
})

const insertables = computed(() => {
  const list: { token: string; id: string; name: string; kind: 'item' | 'spell' }[] = []
  const items = [...Object.values(form.loadout.equipment), ...Object.values(form.loadout.consumables)]
  for (const c of items) {
    for (const id of [c.rec, c.alt]) {
      if (id && !list.some((t) => t.id === id)) list.push({ token: `[item:${id}]`, id, name: data.value?.items[id]?.n ?? id, kind: 'item' })
    }
  }
  for (const s of previewSpells.value) {
    if (!list.some((t) => t.id === s.id)) list.push({ token: `[habilidade:${s.id}]`, id: s.id, name: data.value?.spells[s.id]?.n ?? s.id, kind: 'spell' })
  }
  return list
})

function insertToken(token: string) {
  previewDescription.value = false
  nextTick(() => {
    const el = descriptionInput.value
    const start = el?.selectionStart ?? form.description.length
    const end = el?.selectionEnd ?? start
    form.description = `${form.description.slice(0, start)}${token}${form.description.slice(end)}`
    nextTick(() => {
      el?.focus()
      el?.setSelectionRange(start + token.length, start + token.length)
    })
  })
}

// ---------- Tags e características ----------

function addTag() {
  const values = tagDraft.value.split(',').map((t) => t.trim()).filter(Boolean)
  for (const value of values) {
    if (form.tags.length >= 10) break
    if (!form.tags.some((t) => t.toLowerCase() === value.toLowerCase())) form.tags.push(value.slice(0, 30))
  }
  tagDraft.value = ''
}

function onTagKey(event: KeyboardEvent) {
  if (event.key === ',') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && !tagDraft.value && form.tags.length) {
    form.tags.pop()
  }
}

function removeTag(tag: string) {
  form.tags = form.tags.filter((t) => t !== tag)
}

function addTrait(id: string | null) {
  if (id && form.loadout.traits.length < 3 && !form.loadout.traits.includes(id)) form.loadout.traits.push(id)
}

function removeTrait(id: string) {
  form.loadout.traits = form.loadout.traits.filter((t) => t !== id)
}

// ---------- Carregar / salvar ----------

function fillFrom(build: BuildRecord, asCopy = false) {
  Object.assign(form, {
    name: asCopy ? `${build.name} (cópia)`.slice(0, 60) : build.name,
    category: build.category ?? '',
    tags: [...(build.tags ?? [])],
    description: build.description ?? '',
    author_name: asCopy ? emptyForm().author_name : (build.author_name ?? ''),
    videos: (build.videos ?? []).join(', '),
    privateLink: !build.is_public,
    loadout: normalizeLoadout(build.loadout),
  })
}

async function load() {
  const cloneId = Number(route.query.clonar)
  const id = editingId.value ?? (cloneId || null)
  if (!id) return
  loadingBuild.value = true
  try {
    const build: BuildRecord = await BuildsApi.get(id)
    fillFrom(build, !editingId.value)
    loadedStatus.value = editingId.value ? (build.status ?? 'published') : null
    // Quem já publicou já confirmou a lista uma vez
    if (loadedStatus.value === 'published') Object.assign(checklist, { language: true, formatted: true, guidelines: true })
  } catch (e) {
    loadError.value = friendlyError(e, 'Não foi possível carregar a build.')
  } finally {
    loadingBuild.value = false
    original.value = JSON.stringify(form)
  }
}

const publishBlockers = computed(() => {
  const list: string[] = []
  if (!form.name.trim()) list.push('Título da build')
  if (!form.category) list.push('Tipo de conteúdo')
  if (!form.loadout.equipment.weapon.rec) list.push('Arma recomendada')
  if (!checklist.language || !checklist.formatted || !checklist.guidelines) list.push('Confirmar os itens de "Antes de publicar"')
  return list
})

async function save(status: 'draft' | 'published') {
  saveError.value = ''
  if (status === 'published') {
    attemptedPublish.value = true
    if (publishBlockers.value.length) return
  } else if (!form.name.trim()) {
    saveError.value = 'Dê um título à build para salvar o rascunho.'
    return
  }

  saving.value = true
  try {
    const payload: BuildPayload = {
      name: form.name.trim(),
      description: form.description,
      category: form.category || undefined,
      tags: form.tags,
      loadout: form.loadout as unknown as Record<string, unknown>,
      author_name: form.author_name.trim() || undefined,
      videos: videoIds.value,
      is_public: !form.privateLink,
      status,
    }
    let id = editingId.value
    if (id) {
      await BuildsApi.update(id, payload)
    } else {
      payload.guildId = guild.value?.id
      payload.authorId = Number(auth.user?.id) || undefined
      id = (await BuildsApi.create(payload)).id as number
    }
    loadedStatus.value = status
    original.value = JSON.stringify(form)

    if (status === 'published') {
      toast(editingId.value ? 'Build atualizada' : 'Build publicada', { text: form.name })
      await router.push({ name: 'builds.detail', params: { id } })
    } else {
      toast('Rascunho salvo', { text: 'Só você vê esta build até publicá-la.' })
      if (!editingId.value) await router.replace({ name: 'builds.edit', params: { id } })
    }
  } catch (e) {
    saveError.value = friendlyError(e, 'Não foi possível salvar a build.')
  } finally {
    saving.value = false
  }
}

async function resetForm() {
  const ok = await confirmAction({
    title: 'Resetar o formulário?',
    text: editingId.value ? 'As alterações não salvas serão descartadas.' : 'Tudo o que você preencheu será apagado.',
    confirmLabel: 'Resetar',
    danger: true,
  })
  if (!ok) return
  Object.assign(form, JSON.parse(original.value))
  Object.assign(checklist, { language: false, formatted: false, guidelines: false })
  attemptedPublish.value = false
  saveError.value = ''
}

onBeforeRouteLeave(async () => {
  if (!dirty.value || saving.value) return true
  return confirmAction({
    title: 'Sair sem salvar?',
    text: 'As alterações nesta build serão perdidas.',
    confirmLabel: 'Sair',
    danger: true,
  })
})

onMounted(load)
</script>
