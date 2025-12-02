<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
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
          Referência de IDs para consulta e busca no mercado
        </p>
      </div>

      <!-- Search & Export -->
      <div class="flex gap-2 w-full sm:w-auto flex-wrap">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar item..."
          class="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
        />
        <div class="flex gap-2">
          <button
            @click="showExportModal = true"
            :disabled="exporting"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/>
            </svg>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-8 text-slate-400">
      <div class="inline-block h-8 w-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      <p class="mt-3">Carregando itens...</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="text-center py-8">
      <div class="flex items-center justify-center gap-2 text-rose-300">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- TABLE -->
    <div v-else class="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30 shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-800/60 border-b border-slate-700/50">
            <tr class="text-left text-xs font-bold uppercase tracking-wider text-slate-300">
              <th class="px-4 py-3.5">ID</th>
              <th class="px-4 py-3.5">Nome</th>
              <th class="px-4 py-3.5">Categoria</th>
              <th class="px-4 py-3.5">Tier</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="border-t border-slate-700/30 hover:bg-slate-800/50 transition-all duration-200"
            >
              <td class="px-4 py-3 font-mono text-xs text-purple-300">{{ item.id }}</td>
              <td class="px-4 py-3 font-semibold text-slate-100">{{ item.name }}</td>
              <td class="px-4 py-3 text-slate-300">
                <span class="px-2 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {{ item.category }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-400 text-xs">{{ item.tier }}</td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td class="px-4 py-8 text-center text-slate-400" colspan="4">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 grid place-items-center">
                    <svg class="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
                      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
                      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
                    </svg>
                  </div>
                  <span class="font-medium text-slate-200">
                    {{ searchQuery ? 'Nenhum item encontrado' : 'Sem itens' }}
                  </span>
                  <span class="text-xs text-slate-400">
                    {{ searchQuery ? 'Tente buscar por outro nome' : 'Os itens aparecerão aqui' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION INFO -->
      <div v-if="filteredItems.length > 0" class="px-4 py-3 bg-slate-800/40 border-t border-slate-700/30">
        <p class="text-xs text-slate-400 text-center">
          Mostrando {{ filteredItems.length }} de {{ items.length }} itens
        </p>
      </div>
    </div>

    <!-- EXPORT MODAL -->
    <div
      v-if="showExportModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="showExportModal = false"
    >
      <div class="w-full max-w-2xl rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-100">Opções de Exportação</h3>
          <button
            @click="showExportModal = false"
            class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <!-- Export Options Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Option 1: PDF por Categoria -->
          <button
            @click="openCategorySelector"
            :disabled="exporting"
            class="group flex flex-col items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-5 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-indigo-400 text-xs font-semibold px-2 py-1 rounded-lg bg-indigo-500/20">Opção 1</span>
            </div>
            <div class="text-left">
              <h4 class="font-bold text-slate-100 mb-1">PDF por Categoria</h4>
              <p class="text-xs text-slate-400">Selecione categorias específicas para incluir no PDF</p>
            </div>
          </button>

          <!-- Option 2: JSON -->
          <button
            @click="exportJSON"
            :disabled="exporting"
            class="group flex flex-col items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-5 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-emerald-400 text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-500/20">Opção 2</span>
            </div>
            <div class="text-left">
              <h4 class="font-bold text-slate-100 mb-1">JSON com todos IDs</h4>
              <p class="text-xs text-slate-400">Download instantâneo de arquivo JSON com todos os IDs</p>
            </div>
          </button>

          <!-- Option 3: PDF Otimizado -->
          <button
            @click="exportOptimizedPDF"
            :disabled="exporting"
            class="group flex flex-col items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-5 hover:border-amber-500 hover:bg-amber-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                </svg>
              </div>
              <span class="text-amber-400 text-xs font-semibold px-2 py-1 rounded-lg bg-amber-500/20">Opção 3</span>
            </div>
            <div class="text-left">
              <h4 class="font-bold text-slate-100 mb-1">PDF Otimizado</h4>
              <p class="text-xs text-slate-400">PDF com itens mais comuns e comercializados</p>
            </div>
          </button>

          <!-- Option 4: ZIP Completo -->
          <button
            @click="exportCompleteZIP"
            :disabled="exporting"
            class="group flex flex-col items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-5 hover:border-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clip-rule="evenodd"/>
                  <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"/>
                </svg>
              </div>
              <span class="text-rose-400 text-xs font-semibold px-2 py-1 rounded-lg bg-rose-500/20">Opção 4</span>
            </div>
            <div class="text-left">
              <h4 class="font-bold text-slate-100 mb-1">ZIP Completo</h4>
              <p class="text-xs text-slate-400">Catálogo completo com todos itens e imagens em arquivo ZIP</p>
            </div>
          </button>
        </div>

        <!-- Progress Indicator -->
        <div v-if="exporting" class="mt-6 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 rounded-full border-2 border-indigo-500/60 border-t-indigo-500 animate-spin"></div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-200">{{ exportStatus }}</p>
              <div class="mt-2 h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" :style="{ width: `${exportProgress}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CATEGORY SELECTOR MODAL -->
    <div
      v-if="showCategorySelector"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="showCategorySelector = false"
    >
      <div class="w-full max-w-xl rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-100">Selecionar Categorias</h3>
          <button
            @click="showCategorySelector = false"
            class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <div class="space-y-2 mb-6 max-h-96 overflow-y-auto pr-2">
          <label
            v-for="cat in availableCategories"
            :key="cat"
            class="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/30 p-3 cursor-pointer hover:bg-slate-800/50 transition-all"
          >
            <input
              type="checkbox"
              :value="cat"
              v-model="selectedCategories"
              class="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <span class="text-sm font-medium text-slate-200">{{ cat }}</span>
          </label>
        </div>

        <div class="flex gap-3">
          <button
            @click="showCategorySelector = false"
            class="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="exportFilteredPDF"
            :disabled="selectedCategories.length === 0 || exporting"
            class="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Gerar PDF ({{ selectedCategories.length }} categorias)
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import JSZip from 'jszip'

type AlbionItem = {
  id: string
  name: string
  category: string
  tier: string
}

// Comprehensive list of Albion Online marketable items
const ALBION_ITEMS: AlbionItem[] = [
  // ===== WEAPONS =====

  // Swords
  { id: 'T4_SWORD', name: 'Espada T4', category: 'Espadas', tier: 'T4' },
  { id: 'T5_SWORD', name: 'Espada T5', category: 'Espadas', tier: 'T5' },
  { id: 'T6_SWORD', name: 'Espada T6', category: 'Espadas', tier: 'T6' },
  { id: 'T7_SWORD', name: 'Espada T7', category: 'Espadas', tier: 'T7' },
  { id: 'T8_SWORD', name: 'Espada T8', category: 'Espadas', tier: 'T8' },
  { id: 'T4_2H_CLAYMORE', name: 'Claymore T4', category: 'Espadas', tier: 'T4' },
  { id: 'T5_2H_CLAYMORE', name: 'Claymore T5', category: 'Espadas', tier: 'T5' },
  { id: 'T6_2H_CLAYMORE', name: 'Claymore T6', category: 'Espadas', tier: 'T6' },
  { id: 'T7_2H_CLAYMORE', name: 'Claymore T7', category: 'Espadas', tier: 'T7' },
  { id: 'T8_2H_CLAYMORE', name: 'Claymore T8', category: 'Espadas', tier: 'T8' },
  { id: 'T4_2H_DUALSWORD', name: 'Espadas Duplas T4', category: 'Espadas', tier: 'T4' },
  { id: 'T5_2H_DUALSWORD', name: 'Espadas Duplas T5', category: 'Espadas', tier: 'T5' },
  { id: 'T6_2H_DUALSWORD', name: 'Espadas Duplas T6', category: 'Espadas', tier: 'T6' },
  { id: 'T7_2H_DUALSWORD', name: 'Espadas Duplas T7', category: 'Espadas', tier: 'T7' },
  { id: 'T8_2H_DUALSWORD', name: 'Espadas Duplas T8', category: 'Espadas', tier: 'T8' },
  { id: 'T4_MAIN_RAPIER', name: 'Florete T4', category: 'Espadas', tier: 'T4' },
  { id: 'T5_MAIN_RAPIER', name: 'Florete T5', category: 'Espadas', tier: 'T5' },
  { id: 'T6_MAIN_RAPIER', name: 'Florete T6', category: 'Espadas', tier: 'T6' },
  { id: 'T7_MAIN_RAPIER', name: 'Florete T7', category: 'Espadas', tier: 'T7' },
  { id: 'T8_MAIN_RAPIER', name: 'Florete T8', category: 'Espadas', tier: 'T8' },
  { id: 'T4_2H_CLAYMORE_AVALON', name: 'Carving Sword T4', category: 'Espadas', tier: 'T4' },
  { id: 'T5_2H_CLAYMORE_AVALON', name: 'Carving Sword T5', category: 'Espadas', tier: 'T5' },
  { id: 'T6_2H_CLAYMORE_AVALON', name: 'Carving Sword T6', category: 'Espadas', tier: 'T6' },
  { id: 'T7_2H_CLAYMORE_AVALON', name: 'Carving Sword T7', category: 'Espadas', tier: 'T7' },
  { id: 'T8_2H_CLAYMORE_AVALON', name: 'Carving Sword T8', category: 'Espadas', tier: 'T8' },

  // Axes
  { id: 'T4_AXE', name: 'Machado T4', category: 'Machados', tier: 'T4' },
  { id: 'T5_AXE', name: 'Machado T5', category: 'Machados', tier: 'T5' },
  { id: 'T6_AXE', name: 'Machado T6', category: 'Machados', tier: 'T6' },
  { id: 'T7_AXE', name: 'Machado T7', category: 'Machados', tier: 'T7' },
  { id: 'T8_AXE', name: 'Machado T8', category: 'Machados', tier: 'T8' },
  { id: 'T4_2H_AXE', name: 'Grande Machado T4', category: 'Machados', tier: 'T4' },
  { id: 'T5_2H_AXE', name: 'Grande Machado T5', category: 'Machados', tier: 'T5' },
  { id: 'T6_2H_AXE', name: 'Grande Machado T6', category: 'Machados', tier: 'T6' },
  { id: 'T7_2H_AXE', name: 'Grande Machado T7', category: 'Machados', tier: 'T7' },
  { id: 'T8_2H_AXE', name: 'Grande Machado T8', category: 'Machados', tier: 'T8' },
  { id: 'T4_2H_HALBERD', name: 'Alabarda T4', category: 'Machados', tier: 'T4' },
  { id: 'T5_2H_HALBERD', name: 'Alabarda T5', category: 'Machados', tier: 'T5' },
  { id: 'T6_2H_HALBERD', name: 'Alabarda T6', category: 'Machados', tier: 'T6' },
  { id: 'T7_2H_HALBERD', name: 'Alabarda T7', category: 'Machados', tier: 'T7' },
  { id: 'T8_2H_HALBERD', name: 'Alabarda T8', category: 'Machados', tier: 'T8' },
  { id: 'T4_2H_DUALAXE', name: 'Machados Duplos T4', category: 'Machados', tier: 'T4' },
  { id: 'T5_2H_DUALAXE', name: 'Machados Duplos T5', category: 'Machados', tier: 'T5' },
  { id: 'T6_2H_DUALAXE', name: 'Machados Duplos T6', category: 'Machados', tier: 'T6' },
  { id: 'T7_2H_DUALAXE', name: 'Machados Duplos T7', category: 'Machados', tier: 'T7' },
  { id: 'T8_2H_DUALAXE', name: 'Machados Duplos T8', category: 'Machados', tier: 'T8' },

  // Bows
  { id: 'T4_BOW', name: 'Arco T4', category: 'Arcos', tier: 'T4' },
  { id: 'T5_BOW', name: 'Arco T5', category: 'Arcos', tier: 'T5' },
  { id: 'T6_BOW', name: 'Arco T6', category: 'Arcos', tier: 'T6' },
  { id: 'T7_BOW', name: 'Arco T7', category: 'Arcos', tier: 'T7' },
  { id: 'T8_BOW', name: 'Arco T8', category: 'Arcos', tier: 'T8' },
  { id: 'T4_2H_BOW', name: 'Arco Longo T4', category: 'Arcos', tier: 'T4' },
  { id: 'T5_2H_BOW', name: 'Arco Longo T5', category: 'Arcos', tier: 'T5' },
  { id: 'T6_2H_BOW', name: 'Arco Longo T6', category: 'Arcos', tier: 'T6' },
  { id: 'T7_2H_BOW', name: 'Arco Longo T7', category: 'Arcos', tier: 'T7' },
  { id: 'T8_2H_BOW', name: 'Arco Longo T8', category: 'Arcos', tier: 'T8' },
  { id: 'T4_2H_WARBOW', name: 'Arco de Guerra T4', category: 'Arcos', tier: 'T4' },
  { id: 'T5_2H_WARBOW', name: 'Arco de Guerra T5', category: 'Arcos', tier: 'T5' },
  { id: 'T6_2H_WARBOW', name: 'Arco de Guerra T6', category: 'Arcos', tier: 'T6' },
  { id: 'T7_2H_WARBOW', name: 'Arco de Guerra T7', category: 'Arcos', tier: 'T7' },
  { id: 'T8_2H_WARBOW', name: 'Arco de Guerra T8', category: 'Arcos', tier: 'T8' },

  // Crossbows
  { id: 'T4_CROSSBOW', name: 'Besta T4', category: 'Bestas', tier: 'T4' },
  { id: 'T5_CROSSBOW', name: 'Besta T5', category: 'Bestas', tier: 'T5' },
  { id: 'T6_CROSSBOW', name: 'Besta T6', category: 'Bestas', tier: 'T6' },
  { id: 'T7_CROSSBOW', name: 'Besta T7', category: 'Bestas', tier: 'T7' },
  { id: 'T8_CROSSBOW', name: 'Besta T8', category: 'Bestas', tier: 'T8' },
  { id: 'T4_2H_CROSSBOW', name: 'Besta Pesada T4', category: 'Bestas', tier: 'T4' },
  { id: 'T5_2H_CROSSBOW', name: 'Besta Pesada T5', category: 'Bestas', tier: 'T5' },
  { id: 'T6_2H_CROSSBOW', name: 'Besta Pesada T6', category: 'Bestas', tier: 'T6' },
  { id: 'T7_2H_CROSSBOW', name: 'Besta Pesada T7', category: 'Bestas', tier: 'T7' },
  { id: 'T8_2H_CROSSBOW', name: 'Besta Pesada T8', category: 'Bestas', tier: 'T8' },

  // Fire Staffs
  { id: 'T4_FIRESTAFF', name: 'Cajado de Fogo T4', category: 'Cajados de Fogo', tier: 'T4' },
  { id: 'T5_FIRESTAFF', name: 'Cajado de Fogo T5', category: 'Cajados de Fogo', tier: 'T5' },
  { id: 'T6_FIRESTAFF', name: 'Cajado de Fogo T6', category: 'Cajados de Fogo', tier: 'T6' },
  { id: 'T7_FIRESTAFF', name: 'Cajado de Fogo T7', category: 'Cajados de Fogo', tier: 'T7' },
  { id: 'T8_FIRESTAFF', name: 'Cajado de Fogo T8', category: 'Cajados de Fogo', tier: 'T8' },
  { id: 'T4_2H_INFERNOSTAFF', name: 'Cajado Infernal T4', category: 'Cajados de Fogo', tier: 'T4' },
  { id: 'T5_2H_INFERNOSTAFF', name: 'Cajado Infernal T5', category: 'Cajados de Fogo', tier: 'T5' },
  { id: 'T6_2H_INFERNOSTAFF', name: 'Cajado Infernal T6', category: 'Cajados de Fogo', tier: 'T6' },
  { id: 'T7_2H_INFERNOSTAFF', name: 'Cajado Infernal T7', category: 'Cajados de Fogo', tier: 'T7' },
  { id: 'T8_2H_INFERNOSTAFF', name: 'Cajado Infernal T8', category: 'Cajados de Fogo', tier: 'T8' },

  // Frost Staffs
  { id: 'T4_FROSTSTAFF', name: 'Cajado de Gelo T4', category: 'Cajados de Gelo', tier: 'T4' },
  { id: 'T5_FROSTSTAFF', name: 'Cajado de Gelo T5', category: 'Cajados de Gelo', tier: 'T5' },
  { id: 'T6_FROSTSTAFF', name: 'Cajado de Gelo T6', category: 'Cajados de Gelo', tier: 'T6' },
  { id: 'T7_FROSTSTAFF', name: 'Cajado de Gelo T7', category: 'Cajados de Gelo', tier: 'T7' },
  { id: 'T8_FROSTSTAFF', name: 'Cajado de Gelo T8', category: 'Cajados de Gelo', tier: 'T8' },
  { id: 'T4_2H_GLACIALSTAFF', name: 'Cajado Glacial T4', category: 'Cajados de Gelo', tier: 'T4' },
  { id: 'T5_2H_GLACIALSTAFF', name: 'Cajado Glacial T5', category: 'Cajados de Gelo', tier: 'T5' },
  { id: 'T6_2H_GLACIALSTAFF', name: 'Cajado Glacial T6', category: 'Cajados de Gelo', tier: 'T6' },
  { id: 'T7_2H_GLACIALSTAFF', name: 'Cajado Glacial T7', category: 'Cajados de Gelo', tier: 'T7' },
  { id: 'T8_2H_GLACIALSTAFF', name: 'Cajado Glacial T8', category: 'Cajados de Gelo', tier: 'T8' },

  // Holy Staffs
  { id: 'T4_HOLYSTAFF', name: 'Cajado Sagrado T4', category: 'Cajados Sagrados', tier: 'T4' },
  { id: 'T5_HOLYSTAFF', name: 'Cajado Sagrado T5', category: 'Cajados Sagrados', tier: 'T5' },
  { id: 'T6_HOLYSTAFF', name: 'Cajado Sagrado T6', category: 'Cajados Sagrados', tier: 'T6' },
  { id: 'T7_HOLYSTAFF', name: 'Cajado Sagrado T7', category: 'Cajados Sagrados', tier: 'T7' },
  { id: 'T8_HOLYSTAFF', name: 'Cajado Sagrado T8', category: 'Cajados Sagrados', tier: 'T8' },
  { id: 'T4_2H_DIVINESTAFF', name: 'Cajado Divino T4', category: 'Cajados Sagrados', tier: 'T4' },
  { id: 'T5_2H_DIVINESTAFF', name: 'Cajado Divino T5', category: 'Cajados Sagrados', tier: 'T5' },
  { id: 'T6_2H_DIVINESTAFF', name: 'Cajado Divino T6', category: 'Cajados Sagrados', tier: 'T6' },
  { id: 'T7_2H_DIVINESTAFF', name: 'Cajado Divino T7', category: 'Cajados Sagrados', tier: 'T7' },
  { id: 'T8_2H_DIVINESTAFF', name: 'Cajado Divino T8', category: 'Cajados Sagrados', tier: 'T8' },

  // Arcane Staffs
  { id: 'T4_ARCANESTAFF', name: 'Cajado Arcano T4', category: 'Cajados Arcanos', tier: 'T4' },
  { id: 'T5_ARCANESTAFF', name: 'Cajado Arcano T5', category: 'Cajados Arcanos', tier: 'T5' },
  { id: 'T6_ARCANESTAFF', name: 'Cajado Arcano T6', category: 'Cajados Arcanos', tier: 'T6' },
  { id: 'T7_ARCANESTAFF', name: 'Cajado Arcano T7', category: 'Cajados Arcanos', tier: 'T7' },
  { id: 'T8_ARCANESTAFF', name: 'Cajado Arcano T8', category: 'Cajados Arcanos', tier: 'T8' },
  { id: 'T4_2H_ARCANESTAFF', name: 'Grande Cajado Arcano T4', category: 'Cajados Arcanos', tier: 'T4' },
  { id: 'T5_2H_ARCANESTAFF', name: 'Grande Cajado Arcano T5', category: 'Cajados Arcanos', tier: 'T5' },
  { id: 'T6_2H_ARCANESTAFF', name: 'Grande Cajado Arcano T6', category: 'Cajados Arcanos', tier: 'T6' },
  { id: 'T7_2H_ARCANESTAFF', name: 'Grande Cajado Arcano T7', category: 'Cajados Arcanos', tier: 'T7' },
  { id: 'T8_2H_ARCANESTAFF', name: 'Grande Cajado Arcano T8', category: 'Cajados Arcanos', tier: 'T8' },

  // Curse Staffs
  { id: 'T4_CURSESTAFF', name: 'Cajado Maldito T4', category: 'Cajados Malditos', tier: 'T4' },
  { id: 'T5_CURSESTAFF', name: 'Cajado Maldito T5', category: 'Cajados Malditos', tier: 'T5' },
  { id: 'T6_CURSESTAFF', name: 'Cajado Maldito T6', category: 'Cajados Malditos', tier: 'T6' },
  { id: 'T7_CURSESTAFF', name: 'Cajado Maldito T7', category: 'Cajados Malditos', tier: 'T7' },
  { id: 'T8_CURSESTAFF', name: 'Cajado Maldito T8', category: 'Cajados Malditos', tier: 'T8' },
  { id: 'T4_2H_SKULLORB', name: 'Orbe de Crânio T4', category: 'Cajados Malditos', tier: 'T4' },
  { id: 'T5_2H_SKULLORB', name: 'Orbe de Crânio T5', category: 'Cajados Malditos', tier: 'T5' },
  { id: 'T6_2H_SKULLORB', name: 'Orbe de Crânio T6', category: 'Cajados Malditos', tier: 'T6' },
  { id: 'T7_2H_SKULLORB', name: 'Orbe de Crânio T7', category: 'Cajados Malditos', tier: 'T7' },
  { id: 'T8_2H_SKULLORB', name: 'Orbe de Crânio T8', category: 'Cajados Malditos', tier: 'T8' },

  // Hammers
  { id: 'T4_HAMMER', name: 'Martelo T4', category: 'Martelos', tier: 'T4' },
  { id: 'T5_HAMMER', name: 'Martelo T5', category: 'Martelos', tier: 'T5' },
  { id: 'T6_HAMMER', name: 'Martelo T6', category: 'Martelos', tier: 'T6' },
  { id: 'T7_HAMMER', name: 'Martelo T7', category: 'Martelos', tier: 'T7' },
  { id: 'T8_HAMMER', name: 'Martelo T8', category: 'Martelos', tier: 'T8' },
  { id: 'T4_2H_POLEHAMMER', name: 'Martelo de Haste T4', category: 'Martelos', tier: 'T4' },
  { id: 'T5_2H_POLEHAMMER', name: 'Martelo de Haste T5', category: 'Martelos', tier: 'T5' },
  { id: 'T6_2H_POLEHAMMER', name: 'Martelo de Haste T6', category: 'Martelos', tier: 'T6' },
  { id: 'T7_2H_POLEHAMMER', name: 'Martelo de Haste T7', category: 'Martelos', tier: 'T7' },
  { id: 'T8_2H_POLEHAMMER', name: 'Martelo de Haste T8', category: 'Martelos', tier: 'T8' },

  // Maces
  { id: 'T4_MACE', name: 'Maça T4', category: 'Maças', tier: 'T4' },
  { id: 'T5_MACE', name: 'Maça T5', category: 'Maças', tier: 'T5' },
  { id: 'T6_MACE', name: 'Maça T6', category: 'Maças', tier: 'T6' },
  { id: 'T7_MACE', name: 'Maça T7', category: 'Maças', tier: 'T7' },
  { id: 'T8_MACE', name: 'Maça T8', category: 'Maças', tier: 'T8' },
  { id: 'T4_2H_MACE', name: 'Grande Maça T4', category: 'Maças', tier: 'T4' },
  { id: 'T5_2H_MACE', name: 'Grande Maça T5', category: 'Maças', tier: 'T5' },
  { id: 'T6_2H_MACE', name: 'Grande Maça T6', category: 'Maças', tier: 'T6' },
  { id: 'T7_2H_MACE', name: 'Grande Maça T7', category: 'Maças', tier: 'T7' },
  { id: 'T8_2H_MACE', name: 'Grande Maça T8', category: 'Maças', tier: 'T8' },

  // Daggers
  { id: 'T4_DAGGER', name: 'Adaga T4', category: 'Adagas', tier: 'T4' },
  { id: 'T5_DAGGER', name: 'Adaga T5', category: 'Adagas', tier: 'T5' },
  { id: 'T6_DAGGER', name: 'Adaga T6', category: 'Adagas', tier: 'T6' },
  { id: 'T7_DAGGER', name: 'Adaga T7', category: 'Adagas', tier: 'T7' },
  { id: 'T8_DAGGER', name: 'Adaga T8', category: 'Adagas', tier: 'T8' },
  { id: 'T4_2H_DAGGERPAIR', name: 'Par de Adagas T4', category: 'Adagas', tier: 'T4' },
  { id: 'T5_2H_DAGGERPAIR', name: 'Par de Adagas T5', category: 'Adagas', tier: 'T5' },
  { id: 'T6_2H_DAGGERPAIR', name: 'Par de Adagas T6', category: 'Adagas', tier: 'T6' },
  { id: 'T7_2H_DAGGERPAIR', name: 'Par de Adagas T7', category: 'Adagas', tier: 'T7' },
  { id: 'T8_2H_DAGGERPAIR', name: 'Par de Adagas T8', category: 'Adagas', tier: 'T8' },

  // Spears
  { id: 'T4_SPEAR', name: 'Lança T4', category: 'Lanças', tier: 'T4' },
  { id: 'T5_SPEAR', name: 'Lança T5', category: 'Lanças', tier: 'T5' },
  { id: 'T6_SPEAR', name: 'Lança T6', category: 'Lanças', tier: 'T6' },
  { id: 'T7_SPEAR', name: 'Lança T7', category: 'Lanças', tier: 'T7' },
  { id: 'T8_SPEAR', name: 'Lança T8', category: 'Lanças', tier: 'T8' },
  { id: 'T4_2H_PIKE', name: 'Pique T4', category: 'Lanças', tier: 'T4' },
  { id: 'T5_2H_PIKE', name: 'Pique T5', category: 'Lanças', tier: 'T5' },
  { id: 'T6_2H_PIKE', name: 'Pique T6', category: 'Lanças', tier: 'T6' },
  { id: 'T7_2H_PIKE', name: 'Pique T7', category: 'Lanças', tier: 'T7' },
  { id: 'T8_2H_PIKE', name: 'Pique T8', category: 'Lanças', tier: 'T8' },

  // Quarterstaffs
  { id: 'T4_QUARTERSTAFF', name: 'Bastão T4', category: 'Bastões', tier: 'T4' },
  { id: 'T5_QUARTERSTAFF', name: 'Bastão T5', category: 'Bastões', tier: 'T5' },
  { id: 'T6_QUARTERSTAFF', name: 'Bastão T6', category: 'Bastões', tier: 'T6' },
  { id: 'T7_QUARTERSTAFF', name: 'Bastão T7', category: 'Bastões', tier: 'T7' },
  { id: 'T8_QUARTERSTAFF', name: 'Bastão T8', category: 'Bastões', tier: 'T8' },
  { id: 'T4_2H_IRONCLADEDSTAFF', name: 'Bastão Reforçado T4', category: 'Bastões', tier: 'T4' },
  { id: 'T5_2H_IRONCLADEDSTAFF', name: 'Bastão Reforçado T5', category: 'Bastões', tier: 'T5' },
  { id: 'T6_2H_IRONCLADEDSTAFF', name: 'Bastão Reforçado T6', category: 'Bastões', tier: 'T6' },
  { id: 'T7_2H_IRONCLADEDSTAFF', name: 'Bastão Reforçado T7', category: 'Bastões', tier: 'T7' },
  { id: 'T8_2H_IRONCLADEDSTAFF', name: 'Bastão Reforçado T8', category: 'Bastões', tier: 'T8' },

  // ===== ARMOR =====

  // Plate Armor
  { id: 'T4_ARMOR_PLATE_SET1', name: 'Armadura de Placas T4', category: 'Armadura de Placas', tier: 'T4' },
  { id: 'T5_ARMOR_PLATE_SET1', name: 'Armadura de Placas T5', category: 'Armadura de Placas', tier: 'T5' },
  { id: 'T6_ARMOR_PLATE_SET1', name: 'Armadura de Placas T6', category: 'Armadura de Placas', tier: 'T6' },
  { id: 'T7_ARMOR_PLATE_SET1', name: 'Armadura de Placas T7', category: 'Armadura de Placas', tier: 'T7' },
  { id: 'T8_ARMOR_PLATE_SET1', name: 'Armadura de Placas T8', category: 'Armadura de Placas', tier: 'T8' },
  { id: 'T4_HEAD_PLATE_SET1', name: 'Capacete de Placas T4', category: 'Capacetes de Placas', tier: 'T4' },
  { id: 'T5_HEAD_PLATE_SET1', name: 'Capacete de Placas T5', category: 'Capacetes de Placas', tier: 'T5' },
  { id: 'T6_HEAD_PLATE_SET1', name: 'Capacete de Placas T6', category: 'Capacetes de Placas', tier: 'T6' },
  { id: 'T7_HEAD_PLATE_SET1', name: 'Capacete de Placas T7', category: 'Capacetes de Placas', tier: 'T7' },
  { id: 'T8_HEAD_PLATE_SET1', name: 'Capacete de Placas T8', category: 'Capacetes de Placas', tier: 'T8' },
  { id: 'T4_SHOES_PLATE_SET1', name: 'Botas de Placas T4', category: 'Botas de Placas', tier: 'T4' },
  { id: 'T5_SHOES_PLATE_SET1', name: 'Botas de Placas T5', category: 'Botas de Placas', tier: 'T5' },
  { id: 'T6_SHOES_PLATE_SET1', name: 'Botas de Placas T6', category: 'Botas de Placas', tier: 'T6' },
  { id: 'T7_SHOES_PLATE_SET1', name: 'Botas de Placas T7', category: 'Botas de Placas', tier: 'T7' },
  { id: 'T8_SHOES_PLATE_SET1', name: 'Botas de Placas T8', category: 'Botas de Placas', tier: 'T8' },

  // Leather Armor
  { id: 'T4_ARMOR_LEATHER_SET1', name: 'Armadura de Couro T4', category: 'Armadura de Couro', tier: 'T4' },
  { id: 'T5_ARMOR_LEATHER_SET1', name: 'Armadura de Couro T5', category: 'Armadura de Couro', tier: 'T5' },
  { id: 'T6_ARMOR_LEATHER_SET1', name: 'Armadura de Couro T6', category: 'Armadura de Couro', tier: 'T6' },
  { id: 'T7_ARMOR_LEATHER_SET1', name: 'Armadura de Couro T7', category: 'Armadura de Couro', tier: 'T7' },
  { id: 'T8_ARMOR_LEATHER_SET1', name: 'Armadura de Couro T8', category: 'Armadura de Couro', tier: 'T8' },
  { id: 'T4_HEAD_LEATHER_SET1', name: 'Capacete de Couro T4', category: 'Capacetes de Couro', tier: 'T4' },
  { id: 'T5_HEAD_LEATHER_SET1', name: 'Capacete de Couro T5', category: 'Capacetes de Couro', tier: 'T5' },
  { id: 'T6_HEAD_LEATHER_SET1', name: 'Capacete de Couro T6', category: 'Capacetes de Couro', tier: 'T6' },
  { id: 'T7_HEAD_LEATHER_SET1', name: 'Capacete de Couro T7', category: 'Capacetes de Couro', tier: 'T7' },
  { id: 'T8_HEAD_LEATHER_SET1', name: 'Capacete de Couro T8', category: 'Capacetes de Couro', tier: 'T8' },
  { id: 'T4_SHOES_LEATHER_SET1', name: 'Botas de Couro T4', category: 'Botas de Couro', tier: 'T4' },
  { id: 'T5_SHOES_LEATHER_SET1', name: 'Botas de Couro T5', category: 'Botas de Couro', tier: 'T5' },
  { id: 'T6_SHOES_LEATHER_SET1', name: 'Botas de Couro T6', category: 'Botas de Couro', tier: 'T6' },
  { id: 'T7_SHOES_LEATHER_SET1', name: 'Botas de Couro T7', category: 'Botas de Couro', tier: 'T7' },
  { id: 'T8_SHOES_LEATHER_SET1', name: 'Botas de Couro T8', category: 'Botas de Couro', tier: 'T8' },

  // Cloth Armor
  { id: 'T4_ARMOR_CLOTH_SET1', name: 'Robe de Pano T4', category: 'Armadura de Pano', tier: 'T4' },
  { id: 'T5_ARMOR_CLOTH_SET1', name: 'Robe de Pano T5', category: 'Armadura de Pano', tier: 'T5' },
  { id: 'T6_ARMOR_CLOTH_SET1', name: 'Robe de Pano T6', category: 'Armadura de Pano', tier: 'T6' },
  { id: 'T7_ARMOR_CLOTH_SET1', name: 'Robe de Pano T7', category: 'Armadura de Pano', tier: 'T7' },
  { id: 'T8_ARMOR_CLOTH_SET1', name: 'Robe de Pano T8', category: 'Armadura de Pano', tier: 'T8' },
  { id: 'T4_HEAD_CLOTH_SET1', name: 'Capuz de Pano T4', category: 'Capuzes de Pano', tier: 'T4' },
  { id: 'T5_HEAD_CLOTH_SET1', name: 'Capuz de Pano T5', category: 'Capuzes de Pano', tier: 'T5' },
  { id: 'T6_HEAD_CLOTH_SET1', name: 'Capuz de Pano T6', category: 'Capuzes de Pano', tier: 'T6' },
  { id: 'T7_HEAD_CLOTH_SET1', name: 'Capuz de Pano T7', category: 'Capuzes de Pano', tier: 'T7' },
  { id: 'T8_HEAD_CLOTH_SET1', name: 'Capuz de Pano T8', category: 'Capuzes de Pano', tier: 'T8' },
  { id: 'T4_SHOES_CLOTH_SET1', name: 'Sandálias de Pano T4', category: 'Sandálias de Pano', tier: 'T4' },
  { id: 'T5_SHOES_CLOTH_SET1', name: 'Sandálias de Pano T5', category: 'Sandálias de Pano', tier: 'T5' },
  { id: 'T6_SHOES_CLOTH_SET1', name: 'Sandálias de Pano T6', category: 'Sandálias de Pano', tier: 'T6' },
  { id: 'T7_SHOES_CLOTH_SET1', name: 'Sandálias de Pano T7', category: 'Sandálias de Pano', tier: 'T7' },
  { id: 'T8_SHOES_CLOTH_SET1', name: 'Sandálias de Pano T8', category: 'Sandálias de Pano', tier: 'T8' },

  // ===== RESOURCES =====

  // Ore/Metal
  { id: 'T4_ORE', name: 'Minério de Ferro T4', category: 'Recursos - Minério', tier: 'T4' },
  { id: 'T5_ORE', name: 'Minério de Titânio T5', category: 'Recursos - Minério', tier: 'T5' },
  { id: 'T6_ORE', name: 'Minério de Rúnico T6', category: 'Recursos - Minério', tier: 'T6' },
  { id: 'T7_ORE', name: 'Minério de Alma T7', category: 'Recursos - Minério', tier: 'T7' },
  { id: 'T8_ORE', name: 'Minério de Meteorito T8', category: 'Recursos - Minério', tier: 'T8' },
  { id: 'T4_METALBAR', name: 'Barra de Ferro T4', category: 'Recursos - Metal', tier: 'T4' },
  { id: 'T5_METALBAR', name: 'Barra de Titânio T5', category: 'Recursos - Metal', tier: 'T5' },
  { id: 'T6_METALBAR', name: 'Barra Rúnica T6', category: 'Recursos - Metal', tier: 'T6' },
  { id: 'T7_METALBAR', name: 'Barra da Alma T7', category: 'Recursos - Metal', tier: 'T7' },
  { id: 'T8_METALBAR', name: 'Barra de Meteorito T8', category: 'Recursos - Metal', tier: 'T8' },

  // Wood
  { id: 'T4_WOOD', name: 'Tronco de Carvalho T4', category: 'Recursos - Madeira', tier: 'T4' },
  { id: 'T5_WOOD', name: 'Tronco de Pinheiro T5', category: 'Recursos - Madeira', tier: 'T5' },
  { id: 'T6_WOOD', name: 'Tronco de Cedro T6', category: 'Recursos - Madeira', tier: 'T6' },
  { id: 'T7_WOOD', name: 'Tronco de Bloodoak T7', category: 'Recursos - Madeira', tier: 'T7' },
  { id: 'T8_WOOD', name: 'Tronco de Ashenbark T8', category: 'Recursos - Madeira', tier: 'T8' },
  { id: 'T4_PLANKS', name: 'Tábuas de Carvalho T4', category: 'Recursos - Tábuas', tier: 'T4' },
  { id: 'T5_PLANKS', name: 'Tábuas de Pinheiro T5', category: 'Recursos - Tábuas', tier: 'T5' },
  { id: 'T6_PLANKS', name: 'Tábuas de Cedro T6', category: 'Recursos - Tábuas', tier: 'T6' },
  { id: 'T7_PLANKS', name: 'Tábuas de Bloodoak T7', category: 'Recursos - Tábuas', tier: 'T7' },
  { id: 'T8_PLANKS', name: 'Tábuas de Ashenbark T8', category: 'Recursos - Tábuas', tier: 'T8' },

  // Hide/Leather
  { id: 'T4_HIDE', name: 'Pele de Javali T4', category: 'Recursos - Couro', tier: 'T4' },
  { id: 'T5_HIDE', name: 'Pele de Lobo T5', category: 'Recursos - Couro', tier: 'T5' },
  { id: 'T6_HIDE', name: 'Pele de Urso T6', category: 'Recursos - Couro', tier: 'T6' },
  { id: 'T7_HIDE', name: 'Pele de Dragão T7', category: 'Recursos - Couro', tier: 'T7' },
  { id: 'T8_HIDE', name: 'Pele de Mamute T8', category: 'Recursos - Couro', tier: 'T8' },
  { id: 'T4_LEATHER', name: 'Couro de Javali T4', category: 'Recursos - Couro Refinado', tier: 'T4' },
  { id: 'T5_LEATHER', name: 'Couro de Lobo T5', category: 'Recursos - Couro Refinado', tier: 'T5' },
  { id: 'T6_LEATHER', name: 'Couro de Urso T6', category: 'Recursos - Couro Refinado', tier: 'T6' },
  { id: 'T7_LEATHER', name: 'Couro de Dragão T7', category: 'Recursos - Couro Refinado', tier: 'T7' },
  { id: 'T8_LEATHER', name: 'Couro de Mamute T8', category: 'Recursos - Couro Refinado', tier: 'T8' },

  // Fiber/Cloth
  { id: 'T4_FIBER', name: 'Algodão T4', category: 'Recursos - Fibra', tier: 'T4' },
  { id: 'T5_FIBER', name: 'Linho T5', category: 'Recursos - Fibra', tier: 'T5' },
  { id: 'T6_FIBER', name: 'Seda de Rato T6', category: 'Recursos - Fibra', tier: 'T6' },
  { id: 'T7_FIBER', name: 'Fibra Demoníaca T7', category: 'Recursos - Fibra', tier: 'T7' },
  { id: 'T8_FIBER', name: 'Fibra de Silkweed T8', category: 'Recursos - Fibra', tier: 'T8' },
  { id: 'T4_CLOTH', name: 'Pano de Algodão T4', category: 'Recursos - Pano', tier: 'T4' },
  { id: 'T5_CLOTH', name: 'Pano de Linho T5', category: 'Recursos - Pano', tier: 'T5' },
  { id: 'T6_CLOTH', name: 'Pano de Seda T6', category: 'Recursos - Pano', tier: 'T6' },
  { id: 'T7_CLOTH', name: 'Pano Demoníaco T7', category: 'Recursos - Pano', tier: 'T7' },
  { id: 'T8_CLOTH', name: 'Pano de Silkweed T8', category: 'Recursos - Pano', tier: 'T8' },

  // Stone/Block
  { id: 'T4_ROCK', name: 'Calcário T4', category: 'Recursos - Pedra', tier: 'T4' },
  { id: 'T5_ROCK', name: 'Arenito T5', category: 'Recursos - Pedra', tier: 'T5' },
  { id: 'T6_ROCK', name: 'Travertino T6', category: 'Recursos - Pedra', tier: 'T6' },
  { id: 'T7_ROCK', name: 'Granito T7', category: 'Recursos - Pedra', tier: 'T7' },
  { id: 'T8_ROCK', name: 'Ardósia T8', category: 'Recursos - Pedra', tier: 'T8' },
  { id: 'T4_STONEBLOCK', name: 'Bloco de Calcário T4', category: 'Recursos - Bloco', tier: 'T4' },
  { id: 'T5_STONEBLOCK', name: 'Bloco de Arenito T5', category: 'Recursos - Bloco', tier: 'T5' },
  { id: 'T6_STONEBLOCK', name: 'Bloco de Travertino T6', category: 'Recursos - Bloco', tier: 'T6' },
  { id: 'T7_STONEBLOCK', name: 'Bloco de Granito T7', category: 'Recursos - Bloco', tier: 'T7' },
  { id: 'T8_STONEBLOCK', name: 'Bloco de Ardósia T8', category: 'Recursos - Bloco', tier: 'T8' },

  // ===== ACCESSORIES =====

  // Bags
  { id: 'T4_BAG', name: 'Bolsa T4', category: 'Bolsas', tier: 'T4' },
  { id: 'T5_BAG', name: 'Bolsa T5', category: 'Bolsas', tier: 'T5' },
  { id: 'T6_BAG', name: 'Bolsa T6', category: 'Bolsas', tier: 'T6' },
  { id: 'T7_BAG', name: 'Bolsa T7', category: 'Bolsas', tier: 'T7' },
  { id: 'T8_BAG', name: 'Bolsa T8', category: 'Bolsas', tier: 'T8' },

  // Capes
  { id: 'T4_CAPE', name: 'Capa T4', category: 'Capas', tier: 'T4' },
  { id: 'T5_CAPE', name: 'Capa T5', category: 'Capas', tier: 'T5' },
  { id: 'T6_CAPE', name: 'Capa T6', category: 'Capas', tier: 'T6' },
  { id: 'T7_CAPE', name: 'Capa T7', category: 'Capas', tier: 'T7' },
  { id: 'T8_CAPE', name: 'Capa T8', category: 'Capas', tier: 'T8' },

  // ===== MOUNTS =====

  { id: 'T4_MOUNT_HORSE', name: 'Cavalo de Montaria T4', category: 'Montarias', tier: 'T4' },
  { id: 'T5_MOUNT_HORSE', name: 'Cavalo de Montaria T5', category: 'Montarias', tier: 'T5' },
  { id: 'T6_MOUNT_HORSE', name: 'Cavalo de Montaria T6', category: 'Montarias', tier: 'T6' },
  { id: 'T7_MOUNT_HORSE', name: 'Cavalo de Montaria T7', category: 'Montarias', tier: 'T7' },
  { id: 'T8_MOUNT_HORSE', name: 'Cavalo de Montaria T8', category: 'Montarias', tier: 'T8' },
  { id: 'T5_MOUNT_ARMORED_HORSE', name: 'Cavalo Blindado T5', category: 'Montarias', tier: 'T5' },
  { id: 'T6_MOUNT_ARMORED_HORSE', name: 'Cavalo Blindado T6', category: 'Montarias', tier: 'T6' },
  { id: 'T7_MOUNT_ARMORED_HORSE', name: 'Cavalo Blindado T7', category: 'Montarias', tier: 'T7' },
  { id: 'T8_MOUNT_ARMORED_HORSE', name: 'Cavalo Blindado T8', category: 'Montarias', tier: 'T8' },
  { id: 'T4_MOUNT_OX', name: 'Boi de Carga T4', category: 'Montarias', tier: 'T4' },
  { id: 'T5_MOUNT_OX', name: 'Boi de Carga T5', category: 'Montarias', tier: 'T5' },
  { id: 'T6_MOUNT_OX', name: 'Boi de Carga T6', category: 'Montarias', tier: 'T6' },
  { id: 'T7_MOUNT_OX', name: 'Boi de Carga T7', category: 'Montarias', tier: 'T7' },
  { id: 'T8_MOUNT_OX', name: 'Boi de Carga T8', category: 'Montarias', tier: 'T8' },

  // ===== CONSUMABLES =====

  // Potions
  { id: 'T4_POTION_HEAL', name: 'Poção de Cura Menor T4', category: 'Poções', tier: 'T4' },
  { id: 'T5_POTION_HEAL', name: 'Poção de Cura Média T5', category: 'Poções', tier: 'T5' },
  { id: 'T6_POTION_HEAL', name: 'Poção de Cura Maior T6', category: 'Poções', tier: 'T6' },
  { id: 'T7_POTION_HEAL', name: 'Poção de Cura Elevada T7', category: 'Poções', tier: 'T7' },
  { id: 'T8_POTION_HEAL', name: 'Poção de Cura Suprema T8', category: 'Poções', tier: 'T8' },
  { id: 'T4_POTION_ENERGY', name: 'Poção de Energia Menor T4', category: 'Poções', tier: 'T4' },
  { id: 'T5_POTION_ENERGY', name: 'Poção de Energia Média T5', category: 'Poções', tier: 'T5' },
  { id: 'T6_POTION_ENERGY', name: 'Poção de Energia Maior T6', category: 'Poções', tier: 'T6' },
  { id: 'T7_POTION_ENERGY', name: 'Poção de Energia Elevada T7', category: 'Poções', tier: 'T7' },
  { id: 'T8_POTION_ENERGY', name: 'Poção de Energia Suprema T8', category: 'Poções', tier: 'T8' },

  // Food
  { id: 'T4_MEAL_OMELETTE', name: 'Omelete T4', category: 'Comida', tier: 'T4' },
  { id: 'T5_MEAL_OMELETTE', name: 'Omelete T5', category: 'Comida', tier: 'T5' },
  { id: 'T6_MEAL_OMELETTE', name: 'Omelete T6', category: 'Comida', tier: 'T6' },
  { id: 'T7_MEAL_OMELETTE', name: 'Omelete T7', category: 'Comida', tier: 'T7' },
  { id: 'T8_MEAL_OMELETTE', name: 'Omelete T8', category: 'Comida', tier: 'T8' },
  { id: 'T4_MEAL_STEW', name: 'Ensopado T4', category: 'Comida', tier: 'T4' },
  { id: 'T5_MEAL_STEW', name: 'Ensopado T5', category: 'Comida', tier: 'T5' },
  { id: 'T6_MEAL_STEW', name: 'Ensopado T6', category: 'Comida', tier: 'T6' },
  { id: 'T7_MEAL_STEW', name: 'Ensopado T7', category: 'Comida', tier: 'T7' },
  { id: 'T8_MEAL_STEW', name: 'Ensopado T8', category: 'Comida', tier: 'T8' },
]

const items = ref<AlbionItem[]>(ALBION_ITEMS)
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

// Export modal state
const showExportModal = ref(false)
const showCategorySelector = ref(false)
const exporting = ref(false)
const exportStatus = ref('')
const exportProgress = ref(0)

// Category selection
const selectedCategories = ref<string[]>([])
const availableCategories = computed(() => {
  const categories = new Set<string>()
  items.value.forEach(item => categories.add(item.category))
  return Array.from(categories).sort()
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return items.value
  const query = searchQuery.value.toLowerCase()
  return items.value.filter((item) =>
    item.name.toLowerCase().includes(query) ||
    item.id.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.tier.toLowerCase().includes(query)
  )
})

// Função para buscar imagem do item do Albion Online
function getItemImageUrl(itemId: string): string {
  return `https://render.albiononline.com/v1/item/${itemId}.png?size=217&quality=1`
}

// Função para converter imagem em base64
async function loadImageAsBase64(url: string): Promise<string> {
  if (!url) return ''

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } else {
          resolve('')
        }
      } catch (e) {
        resolve('')
      }
    }
    img.onerror = () => resolve('')
    img.src = url
  })
}

// Helper to open category selector
function openCategorySelector() {
  showExportModal.value = false
  showCategorySelector.value = true
}

// Option 1: Export PDF with selected categories
async function exportFilteredPDF() {
  showCategorySelector.value = false
  exporting.value = true
  exportStatus.value = 'Preparando PDF por categoria...'
  exportProgress.value = 10

  try {
    const filteredItems = items.value.filter(item =>
      selectedCategories.value.includes(item.category)
    )

    exportProgress.value = 20
    exportStatus.value = 'Gerando PDF...'

    await generatePDFCatalog(filteredItems, `catalogo-categorias-${selectedCategories.value.length}`)

    exportProgress.value = 100
    exportStatus.value = 'PDF gerado com sucesso!'

    setTimeout(() => {
      showExportModal.value = false
      exporting.value = false
      exportProgress.value = 0
      selectedCategories.value = []
    }, 1500)
  } catch (e: any) {
    error.value = 'Falha ao gerar PDF: ' + (e.message || 'Erro desconhecido')
    exporting.value = false
  }
}

// Option 2: Export JSON with all IDs
function exportJSON() {
  exporting.value = true
  exportStatus.value = 'Gerando arquivo JSON...'
  exportProgress.value = 50

  try {
    const jsonData = {
      generated: new Date().toISOString(),
      total: items.value.length,
      items: items.value.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tier: item.tier,
        imageUrl: getItemImageUrl(item.id)
      })),
      categories: availableCategories.value
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
      showExportModal.value = false
      exporting.value = false
      exportProgress.value = 0
    }, 1500)
  } catch (e: any) {
    error.value = 'Falha ao gerar JSON: ' + (e.message || 'Erro desconhecido')
    exporting.value = false
  }
}

// Option 3: Export Optimized PDF (common items only)
async function exportOptimizedPDF() {
  exporting.value = true
  exportStatus.value = 'Preparando PDF otimizado...'
  exportProgress.value = 10

  try {
    // Filter for T4-T8 common items only (main weapons, armor, basic resources)
    const commonCategories = [
      'Espadas', 'Machados', 'Arcos', 'Bestas',
      'Cajados de Fogo', 'Cajados de Gelo', 'Cajados Sagrados',
      'Armadura de Placas', 'Armadura de Couro', 'Armadura de Pano',
      'Recursos - Minério', 'Recursos - Metal', 'Recursos - Madeira',
      'Recursos - Tábuas', 'Recursos - Couro', 'Recursos - Couro Refinado',
      'Recursos - Fibra', 'Recursos - Pano', 'Recursos - Pedra', 'Recursos - Bloco'
    ]
    const commonItems = items.value.filter(item =>
      commonCategories.includes(item.category)
    )

    exportProgress.value = 30
    exportStatus.value = 'Gerando PDF otimizado...'

    await generatePDFCatalog(commonItems, 'catalogo-otimizado')

    exportProgress.value = 100
    exportStatus.value = 'PDF otimizado gerado!'

    setTimeout(() => {
      showExportModal.value = false
      exporting.value = false
      exportProgress.value = 0
    }, 1500)
  } catch (e: any) {
    error.value = 'Falha ao gerar PDF otimizado: ' + (e.message || 'Erro desconhecido')
    exporting.value = false
  }
}

// Option 4: Export Complete ZIP with all items and images
async function exportCompleteZIP() {
  exporting.value = true
  exportStatus.value = 'Iniciando geração do ZIP...'
  exportProgress.value = 5

  try {
    const zip = new JSZip()

    // Add README
    const readme = `# Catálogo Completo de Itens do Albion Online

Gerado em: ${new Date().toLocaleString('pt-BR')}
Total de itens: ${items.value.length}

## Conteúdo

- items.json: Dados completos de todos os itens
- images/: Imagens de todos os itens

## Como usar

1. Abra items.json para consultar IDs e informações
2. As imagens estão organizadas na pasta images/
3. Use os IDs para buscar no mercado do Albion Online

## Estrutura do JSON

{
  "id": "ID do item (ex: T4_SWORD)",
  "name": "Nome do item",
  "category": "Categoria",
  "tier": "Tier (T4-T8)"
}
`
    zip.file('README.txt', readme)

    // Add JSON data
    exportStatus.value = 'Adicionando dados JSON...'
    exportProgress.value = 10

    const jsonData = {
      generated: new Date().toISOString(),
      total: items.value.length,
      items: items.value,
      categories: availableCategories.value
    }
    zip.file('items.json', JSON.stringify(jsonData, null, 2))

    // Add images
    exportStatus.value = 'Baixando imagens dos itens...'
    const imagesFolder = zip.folder('images')

    const totalItems = items.value.length
    for (let i = 0; i < totalItems; i++) {
      const item = items.value[i]
      const progress = 10 + Math.floor((i / totalItems) * 70)
      exportProgress.value = progress
      exportStatus.value = `Baixando imagens... (${i + 1}/${totalItems})`

      try {
        const imageUrl = getItemImageUrl(item.id)
        const imageData = await loadImageAsBase64(imageUrl)
        if (imageData && imagesFolder) {
          // Remove data:image/png;base64, prefix
          const base64Data = imageData.split(',')[1]
          imagesFolder.file(`${item.id}.png`, base64Data, { base64: true })
        }
      } catch (e) {
        console.warn(`Failed to load image for ${item.id}`)
      }

      // Add small delay to avoid overwhelming the server
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Generate ZIP
    exportStatus.value = 'Compactando arquivos...'
    exportProgress.value = 85

    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    })

    exportProgress.value = 95
    exportStatus.value = 'Finalizando download...'

    // Download ZIP
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `albion-catalogo-completo-${new Date().toISOString().split('T')[0]}.zip`
    link.click()
    URL.revokeObjectURL(url)

    exportProgress.value = 100
    exportStatus.value = 'ZIP gerado com sucesso!'

    setTimeout(() => {
      showExportModal.value = false
      exporting.value = false
      exportProgress.value = 0
    }, 2000)
  } catch (e: any) {
    error.value = 'Falha ao gerar ZIP: ' + (e.message || 'Erro desconhecido')
    exporting.value = false
    exportProgress.value = 0
  }
}

// Shared PDF generation function
async function generatePDFCatalog(itemsList: AlbionItem[], filenameSuffix: string) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let y = margin

  // Título
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(198, 169, 93) // Gold color
  doc.text('Catálogo de Itens Albion', margin, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text('Referência de IDs para busca no mercado', margin, y)
  y += 12

  // Agrupar itens por categoria
  const itemsByCategory: Record<string, AlbionItem[]> = {}
  itemsList.forEach(item => {
    const category = item.category
    if (!itemsByCategory[category]) itemsByCategory[category] = []
    itemsByCategory[category].push(item)
  })

  const categories = Object.entries(itemsByCategory)
  let processedCategories = 0

  // Processar cada grupo
  for (const [category, categoryItems] of categories) {
    processedCategories++
    const progress = 20 + Math.floor((processedCategories / categories.length) * 60)
    exportProgress.value = progress

    // Verificar se precisa de nova página
    if (y > pageHeight - 40) {
      doc.addPage()
      y = margin
    }

    // Cabeçalho da categoria
    doc.setFillColor(99, 102, 241) // indigo-500
    doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F')
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(category.toUpperCase(), margin + 2, y + 5.5)
    y += 12

    // Processar cada item
    for (const item of categoryItems) {
      // Verificar se precisa de nova página
      if (y > pageHeight - 35) {
        doc.addPage()
        y = margin
      }

      // Box do item
      doc.setFillColor(30, 41, 59) // slate-800
      doc.rect(margin, y, pageWidth - 2 * margin, 28, 'F')

      // Tentar carregar imagem do item
      const imageUrl = getItemImageUrl(item.id)
      try {
        const imageData = await loadImageAsBase64(imageUrl)
        if (imageData) {
          doc.addImage(imageData, 'PNG', margin + 3, y + 3, 22, 22)
        }
      } catch (e) {
        console.warn('Failed to load image for item:', item.id)
      }

      // ID do item
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(192, 132, 252) // purple-300
      doc.text(item.id, margin + 30, y + 8)

      // Nome do item
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(241, 245, 249) // slate-100
      const maxWidth = pageWidth - margin - 35
      const nameLines = doc.splitTextToSize(item.name, maxWidth)
      doc.text(nameLines[0] || item.name, margin + 30, y + 14)

      // Tier
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184) // slate-400
      doc.text(`Tier: ${item.tier}`, margin + 30, y + 20)

      y += 30
    }

    y += 5 // Espaçamento entre grupos
  }

  // Rodapé
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10)
  doc.text(`Total: ${itemsList.length} itens`, pageWidth - margin - 30, pageHeight - 10)

  // Salvar PDF
  const filename = `${filenameSuffix}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
</script>
