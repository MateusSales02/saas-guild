<template>
  <div class="page">
    <PageHeader
      eyebrow="Ferramentas"
      title="Catálogo de itens"
      :subtitle="`${CATALOG.length} itens negociáveis do Albion Online, com nomes oficiais em português.`"
    >
      <template #actions>
        <button type="button" class="btn btn-secondary" :disabled="!filtered.length" @click="showExportModal = true">
          <AppIcon name="download" :size="16" />
          Exportar
        </button>
      </template>
    </PageHeader>

    <!-- Filtros -->
    <div class="panel space-y-4 p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label class="relative block lg:w-80">
          <span class="sr-only">Buscar item</span>
          <AppIcon name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input v-model="search" type="search" placeholder="Buscar por nome ou ID" class="input !pl-9" />
        </label>
        <div class="flex flex-wrap items-center gap-3 lg:ml-auto">
          <div class="seg" role="group" aria-label="Tier exibido">
            <button v-for="t in [4, 5, 6, 7, 8]" :key="t" type="button" class="seg-item" :aria-pressed="tier === t" @click="tier = t">
              T{{ t }}
            </button>
          </div>
          <div class="seg" role="group" aria-label="Modo de exibição">
            <button type="button" class="seg-item" :aria-pressed="view === 'grid'" aria-label="Grade" @click="view = 'grid'">
              <AppIcon name="dashboard" :size="14" />
            </button>
            <button type="button" class="seg-item" :aria-pressed="view === 'list'" aria-label="Lista" @click="view = 'list'">
              <AppIcon name="list" :size="14" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex gap-1.5 overflow-x-auto no-scrollbar" role="group" aria-label="Grupo">
        <button type="button" class="chip" :aria-pressed="group === ''" @click="setGroup('')">Todos</button>
        <button v-for="g in ITEM_GROUPS" :key="g" type="button" class="chip" :aria-pressed="group === g" @click="setGroup(g)">
          {{ g }} <span class="text-slate-500">{{ countByGroup[g] ?? 0 }}</span>
        </button>
      </div>
      <div v-if="group && categories.length > 1" class="flex gap-1.5 overflow-x-auto no-scrollbar border-t border-white/[0.05] pt-3">
        <button type="button" class="chip !h-6 !text-[11px]" :aria-pressed="category === ''" @click="category = ''">Todas</button>
        <button v-for="c in categories" :key="c" type="button" class="chip !h-6 !text-[11px]" :aria-pressed="category === c" @click="category = c">
          {{ c }}
        </button>
      </div>
    </div>

    <div v-if="!filtered.length" class="panel">
      <EmptyState icon="search" title="Nenhum item encontrado" text="Tente outro nome ou limpe os filtros." />
    </div>

    <!-- Grade -->
    <div v-else-if="view === 'grid'" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      <article
        v-for="item in paged"
        :key="item.baseId"
        class="panel group flex flex-col items-center p-4 text-center transition-colors hover:border-gold-500/25"
      >
        <ItemIcon :item-id="idFor(item)" :size="72" :alt="itemName(item, tierFor(item))" class="transition-transform group-hover:scale-105" />
        <p class="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-slate-100">{{ itemName(item, tierFor(item)) }}</p>
        <p class="mt-1 truncate text-[11px] text-slate-500">{{ item.category }}</p>
        <div class="mt-3 flex w-full gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
          <RouterLink :to="{ name: 'market', query: { item: idFor(item) } }" class="btn btn-secondary btn-sm flex-1 !px-2" title="Ver preços no mercado">
            <AppIcon name="market" :size="14" /> Preços
          </RouterLink>
          <RouterLink
            v-if="isCraftable(item)"
            :to="{ name: 'calculator', query: { item: idFor(item) } }"
            class="btn btn-ghost btn-icon btn-sm"
            title="Calcular craft"
            :aria-label="`Calcular craft de ${item.name}`"
          >
            <AppIcon name="calculator" :size="14" />
          </RouterLink>
        </div>
      </article>
    </div>

    <!-- Lista -->
    <section v-else class="panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table min-w-[640px]">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Categoria</th>
              <th scope="col">Tiers</th>
              <th scope="col">ID</th>
              <th scope="col"><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paged" :key="item.baseId">
              <td>
                <div class="flex items-center gap-3">
                  <ItemIcon :item-id="idFor(item)" :size="36" />
                  <span class="font-medium text-slate-100">{{ itemName(item, tierFor(item)) }}</span>
                </div>
              </td>
              <td class="text-slate-400">{{ item.category }}</td>
              <td class="tabular-nums text-slate-400">T{{ item.tiers[0] }}–T{{ item.tiers[item.tiers.length - 1] }}</td>
              <td>
                <button type="button" class="font-mono text-xs text-slate-500 hover:text-gold-300" title="Copiar ID" @click="copy(idFor(item))">
                  {{ idFor(item) }}
                </button>
              </td>
              <td class="text-right">
                <RouterLink :to="{ name: 'market', query: { item: idFor(item) } }" class="btn btn-ghost btn-sm">
                  Preços <AppIcon name="chevron-right" :size="14" />
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="filtered.length" class="flex flex-col items-center gap-2 text-xs text-slate-500">
      <span>Mostrando {{ paged.length }} de {{ filtered.length }} itens</span>
      <button v-if="paged.length < filtered.length" type="button" class="btn btn-secondary btn-sm" @click="pageSize += PAGE">
        Carregar mais
      </button>
    </div>

    <!-- EXPORTAR -->
    <Teleport to="body">
      <div v-if="showExportModal" class="modal-backdrop" @mousedown.self="showExportModal = false" @keydown.esc="showExportModal = false">
        <div class="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="export-items-title">
          <header class="panel-header">
            <div>
              <h2 id="export-items-title" class="section-title">Exportar itens</h2>
              <p class="panel-subtitle">{{ filtered.length }} itens · tier T{{ tier }} · {{ group || 'todos os grupos' }}{{ category ? ` · ${category}` : '' }}</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="showExportModal = false">
              <AppIcon name="x" />
            </button>
          </header>
          <div class="grid gap-2 p-5">
            <button
              v-for="f in FORMATS"
              :key="f.value"
              type="button"
              class="inset flex items-center gap-4 p-4 text-left transition-colors hover:border-gold-500/30"
              :disabled="exporting"
              @click="exportAs(f.value)"
            >
              <span class="icon-tile"><AppIcon :name="f.icon" :size="17" /></span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-medium text-slate-100">{{ f.label }}</span>
                <span class="block text-xs text-slate-500">{{ f.hint }}</span>
              </span>
              <AppIcon name="download" :size="16" class="text-slate-500" />
            </button>
          </div>
          <p class="px-5 pb-5 text-xs text-slate-500">A exportação usa os filtros aplicados na tela.</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { IconName } from '@/components/ui/icons'
import { friendlyError } from '@/lib/errors'
import {
  CATALOG,
  ITEM_GROUPS,
  buildItemId,
  getItemIconUrl,
  itemName,
  normalizeText,
  type CatalogItem,
  type ItemGroup,
} from '@/lib/market'
import { toast } from '@/lib/toast'

type Format = 'json' | 'csv' | 'pdf'

const PAGE = 60
const FORMATS: Array<{ value: Format; label: string; hint: string; icon: IconName }> = [
  { value: 'json', label: 'JSON', hint: 'IDs, nomes, categorias e tiers para integrações', icon: 'file' },
  { value: 'csv', label: 'Planilha (CSV)', hint: 'Abre no Excel ou Google Sheets', icon: 'list' },
  { value: 'pdf', label: 'PDF', hint: 'Referência impressa com IDs por categoria', icon: 'download' },
]
// Grupos sem receita de craft na calculadora
const NOT_CRAFTABLE: ItemGroup[] = ['Artefatos']

const search = ref('')
const group = ref<ItemGroup | ''>('')
const category = ref('')
const tier = ref(4)
const view = ref<'grid' | 'list'>('grid')
const pageSize = ref(PAGE)
const showExportModal = ref(false)
const exporting = ref(false)

const countByGroup = computed(() => {
  const counts: Partial<Record<ItemGroup, number>> = {}
  for (const i of CATALOG) counts[i.group] = (counts[i.group] ?? 0) + 1
  return counts
})

const categories = computed(() => [...new Set(CATALOG.filter((i) => i.group === group.value).map((i) => i.category))])

const filtered = computed(() => {
  const needle = normalizeText(search.value)
  return CATALOG.filter((i) => !group.value || i.group === group.value)
    .filter((i) => !category.value || i.category === category.value)
    .filter(
      (i) =>
        !needle ||
        normalizeText(`${i.name} ${Object.values(i.tierNames ?? {}).join(' ')} ${i.baseId} ${i.category}`).includes(needle),
    )
})

const paged = computed(() => filtered.value.slice(0, pageSize.value))
watch([search, group, category], () => (pageSize.value = PAGE))

function setGroup(g: ItemGroup | '') {
  group.value = g
  category.value = ''
}

function tierFor(item: CatalogItem): number {
  return item.tiers.includes(tier.value) ? tier.value : item.tiers[item.tiers.length - 1] < tier.value ? item.tiers[item.tiers.length - 1] : item.tiers[0]
}

function idFor(item: CatalogItem): string {
  return buildItemId(item.baseId, tierFor(item))
}

function isCraftable(item: CatalogItem): boolean {
  return !NOT_CRAFTABLE.includes(item.group) && item.category !== 'Recursos Brutos'
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast('ID copiado', { text, tone: 'info', duration: 1800 })
  } catch {
    // Clipboard indisponível
  }
}

// ---------- Exportação ----------
function rows() {
  return filtered.value.map((i) => ({
    id: idFor(i),
    nome: itemName(i, tierFor(i)),
    grupo: i.group,
    categoria: i.category,
    tiers: `T${i.tiers[0]}-T${i.tiers[i.tiers.length - 1]}`,
    encantamento_max: i.maxEnchant,
  }))
}

function download(content: BlobPart, type: string, ext: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = `albion-itens-${new Date().toISOString().slice(0, 10)}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportAs(format: Format) {
  exporting.value = true
  try {
    const data = rows()
    if (format === 'json') {
      download(JSON.stringify({ exportadoEm: new Date().toISOString(), total: data.length, itens: data }, null, 2), 'application/json', 'json')
    } else if (format === 'csv') {
      const header = Object.keys(data[0]).join(';')
      const lines = data.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      // BOM para o Excel reconhecer acentos
      download(`﻿${[header, ...lines].join('\n')}`, 'text/csv;charset=utf-8', 'csv')
    } else {
      await exportPDF(data)
    }
    toast('Exportação concluída', { text: `${data.length} itens` })
    showExportModal.value = false
  } catch (e) {
    toast('Não foi possível exportar', { tone: 'error', text: friendlyError(e) })
  } finally {
    exporting.value = false
  }
}

async function exportPDF(data: ReturnType<typeof rows>) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const margin = 15
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Catálogo de itens · Albion Online', margin, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(110, 110, 110)
  doc.text(`${data.length} itens · gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, y)
  y += 10

  let currentCategory = ''
  for (const row of [...data].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome))) {
    if (y > pageHeight - 18) {
      doc.addPage()
      y = margin
    }
    if (row.categoria !== currentCategory) {
      currentCategory = row.categoria
      y += 3
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(120, 95, 30)
      doc.text(currentCategory, margin, y)
      y += 6
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text(row.nome, margin + 2, y)
    doc.setTextColor(110, 110, 110)
    doc.text(row.id, margin + 90, y)
    doc.text(row.tiers, margin + 160, y)
    y += 5.5
  }
  doc.save(`albion-itens-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// Pré-carrega ícones do tier escolhido para a grade não "piscar" ao trocar
watch(tier, () => {
  for (const item of paged.value.slice(0, 24)) new Image().src = getItemIconUrl(idFor(item), 1, 144)
})
</script>
