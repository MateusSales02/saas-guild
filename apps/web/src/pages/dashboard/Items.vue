<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
  >
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
            </svg>
          </div>
          Catálogo de Itens Albion
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Referência completa de IDs - {{ items.length }} itens
        </p>
      </div>

      <button
        @click="openModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/>
        </svg>
        Exportar
      </button>
    </div>

    <!-- Search Filter -->
    <div class="mb-4 relative z-10">
      <label for="search-items" class="sr-only">Buscar itens</label>
      <input
        id="search-items"
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome ou ID..."
        class="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        autocomplete="off"
        @input="currentPage = 1"
        @focus="console.log('Input focused, searchQuery:', searchQuery)"
        @keydown="console.log('Key pressed:', $event.key)"
      />
    </div>

    <!-- Items Table -->
    <div class="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30 mb-4">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">ID</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Nome</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Categoria</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Tier</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <tr v-for="item in paginatedItems" :key="item.id" class="hover:bg-slate-700/30 transition-colors">
              <td class="px-4 py-3 text-sm text-slate-400 font-mono">{{ item.id }}</td>
              <td class="px-4 py-3 text-sm text-slate-200">{{ item.name }}</td>
              <td class="px-4 py-3 text-sm text-slate-300">{{ item.category }}</td>
              <td class="px-4 py-3 text-sm text-indigo-400 font-semibold">{{ item.tier }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-slate-400">
        Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} de {{ filteredItems.length }} itens
      </div>
      <div class="flex gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded bg-slate-700 text-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
        >
          Anterior
        </button>
        <span class="px-3 py-1 text-sm text-slate-300">Página {{ currentPage }} de {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded bg-slate-700 text-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>

    <!-- EXPORT MODAL -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-50">Escolha o formato de exportação</h3>
          <button
            @click="closeModal"
            class="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <!-- Category Selector for PDF (shown only when needed) -->
        <div v-if="showCategorySelector" class="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <h4 class="text-sm font-bold text-emerald-300 mb-3">Selecione as categorias:</h4>
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            <label v-for="cat in availableCategories" :key="cat" class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-emerald-300 transition-colors">
              <input
                type="checkbox"
                :value="cat"
                v-model="selectedCategories"
                class="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
              />
              {{ cat }}
            </label>
          </div>
          <div class="flex gap-2 mt-4">
            <button
              @click="generateFilteredPDF"
              :disabled="selectedCategories.length === 0"
              class="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
            >
              Gerar PDF
            </button>
            <button
              @click="showCategorySelector = false"
              class="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Export Options (hidden when category selector is shown) -->
        <div v-else class="grid gap-4 mb-6">
          <!-- Option 1: PDF Filtrado -->
          <button
            @click="showCategorySelector = true"
            class="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-50 mb-1">Opção 1: PDF Personalizado</h4>
                <p class="text-sm text-slate-400">Escolha categorias específicas para exportar (Armas, Armaduras, etc.)</p>
              </div>
            </div>
          </button>

          <!-- Option 2: JSON -->
          <button
            @click="exportJSON"
            class="p-4 rounded-xl border-2 border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/50 transition-all text-left group"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-green-500/20 text-green-300">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-50 mb-1">Opção 2: JSON com todos IDs</h4>
                <p class="text-sm text-slate-400">Download instantâneo de arquivo JSON com todos os IDs</p>
              </div>
            </div>
          </button>

          <!-- Option 3: PDF Otimizado -->
          <button
            @click="exportOptimizedPDF"
            class="p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-left group"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm1 8a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-50 mb-1">Opção 3: PDF Otimizado</h4>
                <p class="text-sm text-slate-400">PDF com itens T4-T6 mais comuns do mercado</p>
              </div>
            </div>
          </button>

          <!-- Option 4: ZIP Completo -->
          <button
            @click="exportZIP"
            class="p-4 rounded-xl border-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-left group"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-50 mb-1">Opção 4: ZIP Completo</h4>
                <p class="text-sm text-slate-400">Arquivo compactado com JSON, README e primeiras 20 imagens (pode demorar)</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Status Messages -->
        <div v-if="exportStatus" class="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p class="text-sm text-blue-300">{{ exportStatus }}</p>
          <div v-if="exportProgress > 0" class="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: exportProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import jsPDF from 'jspdf'
import JSZip from 'jszip'
import itemsData from '@/data/albion-items.json'

type AlbionItem = {
  id: string
  name: string
  category: string
  tier: string
}

const items = ref<AlbionItem[]>(itemsData as AlbionItem[])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Debug: Watch searchQuery changes
watch(searchQuery, (newVal) => {
  console.log('searchQuery changed to:', newVal)
})

const showExportModal = ref(false)
const showCategorySelector = ref(false)
const selectedCategories = ref<string[]>([])
const exportStatus = ref('')
const exportProgress = ref(0)

// Debug: Log modal state
console.log('Items.vue mounted, showExportModal:', showExportModal.value)

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item =>
    item.id.toLowerCase().includes(query) ||
    item.name.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.value.slice(start, end)
})

const availableCategories = computed(() => {
  return [...new Set(items.value.map(item => item.category))].sort()
})

function openModal() {
  console.log('Opening modal')
  showExportModal.value = true
}

function closeModal() {
  console.log('Closing modal')
  showExportModal.value = false
  showCategorySelector.value = false
  selectedCategories.value = []
  exportStatus.value = ''
  exportProgress.value = 0
}

function exportJSON() {
  try {
    exportStatus.value = 'Gerando JSON...'
    exportProgress.value = 50

    const jsonData = {
      generated: new Date().toISOString(),
      total: items.value.length,
      items: items.value
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `albion-items-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    exportProgress.value = 100
    exportStatus.value = 'JSON baixado com sucesso!'

    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (e: any) {
    exportStatus.value = 'Erro: ' + e.message
    console.error(e)
  }
}

function generateFilteredPDF() {
  try {
    exportStatus.value = 'Gerando PDF filtrado...'
    exportProgress.value = 25

    const filteredItems = items.value.filter(item =>
      selectedCategories.value.includes(item.category)
    )

    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(16)
    doc.text('Albion Items - PDF Filtrado', 20, y)
    y += 10

    doc.setFontSize(10)
    doc.text(`Categorias: ${selectedCategories.value.join(', ')}`, 20, y)
    y += 10
    doc.text(`Total de itens: ${filteredItems.length}`, 20, y)
    y += 15

    exportProgress.value = 50

    doc.setFontSize(9)
    filteredItems.forEach((item, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      doc.text(`${item.id} - ${item.name} (${item.tier})`, 20, y)
      y += 7

      if (index % 20 === 0 && index > 0) {
        exportProgress.value = 50 + (index / filteredItems.length) * 40
      }
    })

    exportProgress.value = 95

    doc.save(`albion-items-filtrado-${new Date().toISOString().split('T')[0]}.pdf`)

    exportProgress.value = 100
    exportStatus.value = 'PDF filtrado gerado com sucesso!'

    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (e: any) {
    exportStatus.value = 'Erro: ' + e.message
    console.error(e)
  }
}

function exportOptimizedPDF() {
  try {
    exportStatus.value = 'Gerando PDF otimizado (T4-T6)...'
    exportProgress.value = 25

    const optimizedItems = items.value.filter(item =>
      item.tier === 'T4' || item.tier === 'T5' || item.tier === 'T6'
    )

    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(16)
    doc.text('Albion Items - PDF Otimizado (T4-T6)', 20, y)
    y += 10

    doc.setFontSize(10)
    doc.text(`Apenas itens T4, T5 e T6 mais comuns`, 20, y)
    y += 10
    doc.text(`Total de itens: ${optimizedItems.length}`, 20, y)
    y += 15

    exportProgress.value = 50

    doc.setFontSize(9)
    optimizedItems.forEach((item, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }

      doc.text(`${item.id} - ${item.name} (${item.tier})`, 20, y)
      y += 7

      if (index % 20 === 0 && index > 0) {
        exportProgress.value = 50 + (index / optimizedItems.length) * 40
      }
    })

    exportProgress.value = 95

    doc.save(`albion-items-otimizado-${new Date().toISOString().split('T')[0]}.pdf`)

    exportProgress.value = 100
    exportStatus.value = 'PDF otimizado gerado com sucesso!'

    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (e: any) {
    exportStatus.value = 'Erro: ' + e.message
    console.error(e)
  }
}

async function exportZIP() {
  try {
    exportStatus.value = 'Iniciando geração do ZIP...'
    exportProgress.value = 5

    const zip = new JSZip()

    exportStatus.value = 'Adicionando JSON ao ZIP...'
    const jsonData = {
      generated: new Date().toISOString(),
      total: items.value.length,
      items: items.value
    }
    zip.file('albion-items.json', JSON.stringify(jsonData, null, 2))
    exportProgress.value = 20

    exportStatus.value = 'Adicionando README...'
    const readme = `ALBION ITEMS EXPORT\nData: ${new Date().toLocaleString('pt-BR')}\nTotal: ${items.value.length}\n\nCONTEÚDO:\n- albion-items.json: Todos os itens\n- images/: Primeiras 20 imagens\n\nFORMATO JSON:\n- id, name, category, tier\n\nAPI: https://render.albiononline.com/v1/item/{item-id}.png\nSite: https://albiononline.com`
    zip.file('README.txt', readme)
    exportProgress.value = 30

    exportStatus.value = 'Baixando imagens (0/20)...'
    const imageFolder = zip.folder('images')
    const itemsToDownload = items.value.slice(0, 20)

    for (let i = 0; i < itemsToDownload.length; i++) {
      const item = itemsToDownload[i]
      exportStatus.value = `Baixando imagens (${i + 1}/20)...`
      try {
        const imageUrl = `https://render.albiononline.com/v1/item/${item.id}.png`
        const response = await fetch(imageUrl)
        if (response.ok) {
          const blob = await response.blob()
          const arrayBuffer = await blob.arrayBuffer()
          imageFolder?.file(`${item.id}.png`, arrayBuffer)
          console.log(`Downloaded: ${item.id}`)
        } else {
          console.log(`Failed to download: ${item.id}`)
        }
      } catch (err) {
        console.log(`Error downloading ${item.id}:`, err)
      }
      exportProgress.value = 30 + ((i + 1) / 20) * 60
    }

    exportStatus.value = 'Gerando arquivo ZIP...'
    exportProgress.value = 95
    const content = await zip.generateAsync({ type: 'blob' })

    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `albion-items-completo-${new Date().toISOString().split('T')[0]}.zip`
    link.click()
    URL.revokeObjectURL(url)

    exportProgress.value = 100
    exportStatus.value = 'ZIP completo gerado com sucesso!'

    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (e: any) {
    exportStatus.value = 'Erro: ' + e.message
    console.error(e)
  }
}
</script>
