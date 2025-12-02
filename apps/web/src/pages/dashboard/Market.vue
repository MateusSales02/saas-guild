<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl"
  >
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          Mercado Albion
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Consulte preços e tendências do mercado em tempo real
        </p>
      </div>

      <!-- Export PDF Button -->
      <button
        v-if="prices.length > 0"
        @click="generateMarketPDF"
        :disabled="generatingPDF"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
      >
        <span
          v-if="generatingPDF"
          class="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin"
        />
        <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/>
        </svg>
        {{ generatingPDF ? 'Gerando...' : 'Exportar PDF' }}
      </button>
    </div>

    <!-- ITEM GUIDE -->
    <div class="mb-6 p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <div class="flex items-center justify-between mb-3">
        <button
          @click="showGuide = !showGuide"
          class="flex-1 flex items-center justify-between text-left"
        >
          <h3 class="text-lg font-bold text-slate-50">Guia de Itens</h3>
          <svg
            class="w-5 h-5 text-slate-400 transition-transform duration-300"
            :class="{ 'rotate-180': showGuide }"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <RouterLink
          :to="{ name: 'items' }"
          class="ml-4 text-xs text-[#C6A95D] hover:text-amber-400 font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
          </svg>
          Ver todos os itens
        </RouterLink>
      </div>

      <div v-show="showGuide" class="mt-4 space-y-4">
        <p class="text-sm text-slate-400">Clique em um item para copiá-lo para o campo de busca</p>

        <div class="grid sm:grid-cols-2 gap-4">
          <!-- Weapons -->
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <h4 class="text-sm font-bold text-amber-400 mb-2">Armas</h4>
            <div class="flex flex-wrap gap-2">
              <button @click="selectItem('T4_SWORD')" class="item-tag">T4_SWORD</button>
              <button @click="selectItem('T5_SWORD')" class="item-tag">T5_SWORD</button>
              <button @click="selectItem('T6_SWORD')" class="item-tag">T6_SWORD</button>
              <button @click="selectItem('T4_AXE')" class="item-tag">T4_AXE</button>
              <button @click="selectItem('T5_BOW')" class="item-tag">T5_BOW</button>
              <button @click="selectItem('T6_CROSSBOW')" class="item-tag">T6_CROSSBOW</button>
            </div>
          </div>

          <!-- Armor -->
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <h4 class="text-sm font-bold text-blue-400 mb-2">Armaduras</h4>
            <div class="flex flex-wrap gap-2">
              <button @click="selectItem('T4_HEAD_PLATE_SET1')" class="item-tag">T4_HEAD_PLATE_SET1</button>
              <button @click="selectItem('T5_ARMOR_PLATE_SET1')" class="item-tag">T5_ARMOR_PLATE_SET1</button>
              <button @click="selectItem('T6_SHOES_PLATE_SET1')" class="item-tag">T6_SHOES_PLATE_SET1</button>
              <button @click="selectItem('T4_HEAD_LEATHER_SET1')" class="item-tag">T4_HEAD_LEATHER_SET1</button>
            </div>
          </div>

          <!-- Resources -->
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <h4 class="text-sm font-bold text-green-400 mb-2">Recursos</h4>
            <div class="flex flex-wrap gap-2">
              <button @click="selectItem('T4_ORE')" class="item-tag">T4_ORE</button>
              <button @click="selectItem('T5_ORE')" class="item-tag">T5_ORE</button>
              <button @click="selectItem('T6_WOOD')" class="item-tag">T6_WOOD</button>
              <button @click="selectItem('T7_HIDE')" class="item-tag">T7_HIDE</button>
              <button @click="selectItem('T8_FIBER')" class="item-tag">T8_FIBER</button>
              <button @click="selectItem('T4_ROCK')" class="item-tag">T4_ROCK</button>
            </div>
          </div>

          <!-- Consumables -->
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <h4 class="text-sm font-bold text-rose-400 mb-2">Consumíveis</h4>
            <div class="flex flex-wrap gap-2">
              <button @click="selectItem('T4_POTION_HEAL')" class="item-tag">T4_POTION_HEAL</button>
              <button @click="selectItem('T5_POTION_HEAL')" class="item-tag">T5_POTION_HEAL</button>
              <button @click="selectItem('T6_MEAL_OMELETTE')" class="item-tag">T6_MEAL_OMELETTE</button>
              <button @click="selectItem('T4_POTION_ENERGY')" class="item-tag">T4_POTION_ENERGY</button>
            </div>
          </div>

          <!-- Bags & Capes -->
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <h4 class="text-sm font-bold text-purple-400 mb-2">Bolsas & Capas</h4>
            <div class="flex flex-wrap gap-2">
              <button @click="selectItem('T4_BAG')" class="item-tag">T4_BAG</button>
              <button @click="selectItem('T5_BAG')" class="item-tag">T5_BAG</button>
              <button @click="selectItem('T6_BAG')" class="item-tag">T6_BAG</button>
              <button @click="selectItem('T4_CAPE')" class="item-tag">T4_CAPE</button>
              <button @click="selectItem('T5_CAPE')" class="item-tag">T5_CAPE</button>
            </div>
          </div>

          <!-- Mounts -->
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <h4 class="text-sm font-bold text-yellow-400 mb-2">Montarias</h4>
            <div class="flex flex-wrap gap-2">
              <button @click="selectItem('T4_MOUNT_HORSE')" class="item-tag">T4_MOUNT_HORSE</button>
              <button @click="selectItem('T5_MOUNT_HORSE')" class="item-tag">T5_MOUNT_HORSE</button>
              <button @click="selectItem('T6_MOUNT_OX')" class="item-tag">T6_MOUNT_OX</button>
              <button @click="selectItem('T7_MOUNT_ARMORED_HORSE')" class="item-tag">T7_MOUNT_ARMORED_HORSE</button>
            </div>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p class="text-xs text-amber-300">
            <span class="font-bold">💡 Dica:</span> T4-T8 representa o tier do item. Você pode adicionar encantamentos usando o seletor abaixo.
          </p>
        </div>
      </div>
    </div>

    <!-- SEARCH FORM -->
    <div class="mb-6 p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
      <h3 class="text-lg font-bold text-slate-50 mb-4">Buscar Item</h3>
      <div class="grid gap-4">
        <!-- Row 1: Item and Enchantment -->
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-xs text-slate-400 mb-2 font-semibold">Item ID</label>
            <input
              v-model="searchItem"
              type="text"
              placeholder="Ex: T4_BAG, T6_SWORD, T7_ORE"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-2 font-semibold">Encantamento</label>
            <select
              v-model="selectedEnchantment"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            >
              <option value="">Sem encantamento (.0)</option>
              <option value="@1">Encantamento 1 (.1)</option>
              <option value="@2">Encantamento 2 (.2)</option>
              <option value="@3">Encantamento 3 (.3)</option>
              <option value="@4">Encantamento 4 (.4)</option>
            </select>
          </div>
        </div>

        <!-- Row 2: City and Quality -->
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-xs text-slate-400 mb-2 font-semibold">Cidade</label>
            <select
              v-model="selectedCity"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            >
              <option value="">Todas as cidades</option>
              <option value="Caerleon">Caerleon</option>
              <option value="Bridgewatch">Bridgewatch</option>
              <option value="Lymhurst">Lymhurst</option>
              <option value="Fort Sterling">Fort Sterling</option>
              <option value="Thetford">Thetford</option>
              <option value="Martlock">Martlock</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-2 font-semibold">Qualidade</label>
            <select
              v-model="selectedQuality"
              class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
            >
              <option value="">Todas as qualidades</option>
              <option value="1">Normal</option>
              <option value="2">Good</option>
              <option value="3">Outstanding</option>
              <option value="4">Excellent</option>
              <option value="5">Masterpiece</option>
            </select>
          </div>
        </div>

        <!-- Search Button -->
        <button
          @click="fetchPrices"
          :disabled="loading || !searchItem"
          class="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
        >
          {{ loading ? 'Buscando...' : 'Buscar Preços' }}
        </button>
      </div>
      <p v-if="error" class="mt-3 flex items-center gap-2 text-sm text-rose-300">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        {{ error }}
      </p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-8 text-slate-400">
      <div class="inline-block h-8 w-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="mt-3">Carregando dados do mercado...</p>
    </div>

    <!-- RESULTS -->
    <div v-else-if="prices.length > 0" class="space-y-4">
      <h3 class="text-lg font-bold text-slate-50">Resultados</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="price in prices"
          :key="`${price.item_id}-${price.city}-${price.quality}`"
          class="group p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-amber-500/50 transition-all duration-300"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {{ price.city }}
                </h4>
                <span v-if="price.quality > 0" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {{ getQualityLabel(price.quality) }}
                </span>
              </div>
              <p class="text-xs text-slate-500">{{ price.item_id }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Sell Price -->
            <div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div class="flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-semibold">Venda</span>
                <span class="text-lg font-bold text-emerald-300">
                  {{ formatPrice(price.sell_price_min) }}
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mt-1">
                {{ formatDate(price.sell_price_min_date) }}
              </p>
            </div>

            <!-- Buy Price -->
            <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div class="flex items-center justify-between">
                <span class="text-xs text-blue-400 font-semibold">Compra</span>
                <span class="text-lg font-bold text-blue-300">
                  {{ formatPrice(price.buy_price_max) }}
                </span>
              </div>
              <p class="text-[10px] text-slate-500 mt-1">
                {{ formatDate(price.buy_price_max_date) }}
              </p>
            </div>

            <!-- Profit -->
            <div v-if="price.sell_price_min > 0 && price.buy_price_max > 0" class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div class="flex items-center justify-between">
                <span class="text-xs text-amber-400 font-semibold">Lucro Potencial</span>
                <span class="text-lg font-bold text-amber-300">
                  {{ formatPrice(price.sell_price_min - price.buy_price_max) }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else-if="!loading && prices.length === 0 && searchItem"
      class="text-center py-12 text-slate-400"
    >
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-xl font-bold text-slate-300 mb-2">Nenhum resultado encontrado</h3>
      <p class="text-sm">Tente buscar outro item ou cidade</p>
    </div>

    <!-- INITIAL STATE -->
    <div
      v-else
      class="text-center py-12 text-slate-400"
    >
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-slate-300 mb-2">Busque um item para começar</h3>
      <p class="text-sm">Digite o ID de um item do Albion Online para consultar os preços</p>
      <div class="mt-6 text-xs text-slate-500 space-y-4">
        <div>
          <p class="font-semibold mb-2">Exemplos de IDs básicos:</p>
          <div class="flex flex-wrap gap-2 justify-center">
            <code class="px-2 py-1 bg-slate-800/50 rounded">T4_BAG</code>
            <code class="px-2 py-1 bg-slate-800/50 rounded">T5_POTION_HEAL</code>
            <code class="px-2 py-1 bg-slate-800/50 rounded">T6_SWORD</code>
            <code class="px-2 py-1 bg-slate-800/50 rounded">T7_ORE</code>
          </div>
        </div>
        <div>
          <p class="font-semibold mb-2">💡 Dica: Use o seletor de encantamento</p>
          <p class="text-slate-400">Digite apenas o ID base (ex: T4_BAG) e selecione o encantamento no filtro acima</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { AlbionDataApi, type AlbionPriceData } from '@/lib/api'
import jsPDF from 'jspdf'

const searchItem = ref('')
const selectedCity = ref('')
const selectedEnchantment = ref('')
const selectedQuality = ref('')
const loading = ref(false)
const error = ref('')
const prices = ref<AlbionPriceData[]>([])
const showGuide = ref(false)
const generatingPDF = ref(false)

async function fetchPrices() {
  if (!searchItem.value.trim()) return

  loading.value = true
  error.value = ''
  prices.value = []

  try {
    // Constrói o item ID com encantamento se selecionado
    let itemId = searchItem.value.trim().toUpperCase()
    if (selectedEnchantment.value) {
      itemId = itemId + selectedEnchantment.value
    }

    const items = [itemId]
    const locations = selectedCity.value ? [selectedCity.value] : undefined
    const qualities = selectedQuality.value ? [parseInt(selectedQuality.value)] : undefined

    const data = await AlbionDataApi.getPrices(items, locations, qualities)
    prices.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Falha ao buscar preços'
  } finally {
    loading.value = false
  }
}

function formatPrice(price: number): string {
  if (!price || price === 0) return 'N/A'
  return new Intl.NumberFormat('pt-BR').format(price)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`

    return date.toLocaleDateString('pt-BR')
  } catch {
    return 'N/A'
  }
}

function getQualityLabel(quality: number): string {
  switch (quality) {
    case 1: return 'Normal'
    case 2: return 'Good'
    case 3: return 'Outstanding'
    case 4: return 'Excellent'
    case 5: return 'Masterpiece'
    default: return ''
  }
}

function selectItem(itemId: string) {
  searchItem.value = itemId
  showGuide.value = false
}

// Função para buscar imagem do item do Albion Online
function getItemImageUrl(itemId: string): string {
  // Remove enchantment suffix para buscar a imagem base
  const baseItemId = itemId.replace(/@\d+$/, '')
  return `https://render.albiononline.com/v1/item/${baseItemId}.png?size=217&quality=1`
}

// Função para converter imagem em base64
async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } else {
        reject(new Error('Failed to get canvas context'))
      }
    }
    img.onerror = () => {
      // Se falhar, retorna uma string vazia
      resolve('')
    }
    img.src = url
  })
}

async function generateMarketPDF() {
  generatingPDF.value = true

  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let y = margin

    // Título
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório de Mercado - Albion Online', margin, y)
    y += 10

    // Subtítulo
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Item: ${searchItem.value}${selectedEnchantment.value || ''}`, margin, y)
    y += 6

    if (selectedCity.value) {
      doc.text(`Cidade: ${selectedCity.value}`, margin, y)
      y += 6
    }

    if (selectedQuality.value) {
      doc.text(`Qualidade: ${getQualityLabel(parseInt(selectedQuality.value))}`, margin, y)
      y += 6
    }

    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin, y)
    y += 12

    // Processar cada preço
    for (const price of prices.value) {
      // Verificar se precisa de nova página
      if (y > pageHeight - 80) {
        doc.addPage()
        y = margin
      }

      // Box para o item
      doc.setFillColor(30, 41, 59) // slate-800
      doc.rect(margin, y, pageWidth - 2 * margin, 65, 'F')

      // Tentar carregar imagem do item
      const imageUrl = getItemImageUrl(price.item_id)
      try {
        const imageData = await loadImageAsBase64(imageUrl)
        if (imageData) {
          // Adicionar imagem (redimensionada)
          doc.addImage(imageData, 'PNG', margin + 5, y + 5, 20, 20)
        }
      } catch (e) {
        console.warn('Failed to load image:', e)
      }

      // Informações do item
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(198, 169, 93) // gold color
      doc.text(price.city.toUpperCase(), margin + 30, y + 10)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184) // slate-400
      doc.text(price.item_id, margin + 30, y + 16)

      if (price.quality > 0) {
        doc.setTextColor(252, 211, 77) // amber-300
        doc.text(`Qualidade: ${getQualityLabel(price.quality)}`, margin + 30, y + 21)
      }

      // Preços
      y += 30

      // Preço de venda
      doc.setFillColor(16, 185, 129, 25) // emerald bg
      doc.rect(margin + 5, y, 55, 15, 'F')
      doc.setFontSize(8)
      doc.setTextColor(16, 185, 129) // emerald
      doc.text('Venda', margin + 7, y + 5)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(formatPrice(price.sell_price_min), margin + 7, y + 11)

      // Preço de compra
      doc.setFillColor(59, 130, 246, 25) // blue bg
      doc.rect(margin + 65, y, 55, 15, 'F')
      doc.setTextColor(59, 130, 246) // blue
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Compra', margin + 67, y + 5)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(formatPrice(price.buy_price_max), margin + 67, y + 11)

      // Lucro potencial
      if (price.sell_price_min > 0 && price.buy_price_max > 0) {
        const profit = price.sell_price_min - price.buy_price_max
        doc.setFillColor(251, 191, 36, 25) // amber bg
        doc.rect(margin + 125, y, 55, 15, 'F')
        doc.setTextColor(251, 191, 36) // amber
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text('Lucro', margin + 127, y + 5)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(formatPrice(profit), margin + 127, y + 11)
      }

      y += 25

      // Datas de atualização
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text(`Atualizado: ${formatDate(price.sell_price_min_date)}`, margin + 5, y)

      y += 10
    }

    // Rodapé
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10)
    doc.text('Powered by SaaS Guild', pageWidth - margin - 35, pageHeight - 10)

    // Salvar PDF
    const filename = `mercado-albion-${searchItem.value}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  } catch (e: any) {
    error.value = 'Falha ao gerar PDF: ' + (e.message || 'Erro desconhecido')
  } finally {
    generatingPDF.value = false
  }
}
</script>

<style scoped>
.item-tag {
  @apply px-2 py-1 rounded text-xs font-mono bg-slate-800/80 text-slate-300 border border-slate-600/50 hover:bg-slate-700 hover:border-amber-500/50 hover:text-amber-300 transition-all cursor-pointer;
}
</style>
