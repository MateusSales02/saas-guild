<template>
  <section class="grid lg:grid-cols-[2fr_1fr] gap-6">
    <!-- LISTA DE BUILDS -->
    <div
      class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
    >
      <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
            Builds
          </h2>
          <p class="mt-2 text-sm text-slate-400">
            Filtre por classe, função ou palavra-chave
          </p>
        </div>

        <div class="flex flex-wrap gap-2 items-center">
          <input
            v-model="filters.search"
            @input="fetchBuilds"
            type="text"
            placeholder="Buscar"
            class="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
          />

          <select
            v-model.number="filters.classId"
            @change="onClassFilterChange"
            class="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 text-sm focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          >
            <option :value="undefined">Todas classes</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>

          <select
            v-model.number="filters.specId"
            @change="fetchBuilds"
            class="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 text-sm focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
          >
            <option :value="undefined">Todas specs</option>
            <option v-for="s in specs" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>

          <label class="flex items-center gap-1.5 text-xs cursor-pointer text-slate-300 hover:text-slate-100 transition-colors">
            <input v-model="filters.onlyMine" type="checkbox" class="accent-[#C6A95D] rounded" />
            Só minhas
          </label>
        </div>
      </header>

      <div v-if="loading" class="text-sm text-slate-400">Carregando builds...</div>
      <div v-if="error" class="text-sm text-red-400 flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        {{ error }}
      </div>

      <div v-if="!loading && !error" class="grid md:grid-cols-2 gap-4">
        <article
          v-for="build in builds"
          :key="build.id"
          class="group relative p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-purple-500/50 flex flex-col justify-between transition-all duration-300 shadow-lg"
        >
          <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />

          <div class="relative">
            <header class="flex items-start justify-between gap-2 mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-sm text-slate-100 mb-1">{{ build.name }}</h3>
                <p class="text-xs text-slate-400 space-x-1">
                  <span class="font-medium text-purple-300">{{ build.role || 'Sem função' }}</span>
                  <span class="text-slate-600">·</span>
                  <span>{{ build.class?.name || 'Classe indefinida' }}</span>
                  <span v-if="build.spec?.name" class="text-slate-600">·</span>
                  <span v-if="build.spec?.name" class="text-emerald-300">{{ build.spec.name }}</span>
                </p>
              </div>
              <span
                class="px-2 py-1 rounded-lg text-[10px] font-semibold border"
                :class="build.is_public ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-700/50 text-slate-300 border-slate-600'"
              >
                {{ build.is_public ? 'Pública' : 'Privada' }}
              </span>
            </header>

            <p v-if="build.description" class="mt-2 text-xs text-slate-400 line-clamp-2 mb-3">
              {{ build.description }}
            </p>

            <dl class="grid grid-cols-2 gap-2 text-[11px] mb-3">
              <div class="p-2 rounded-lg bg-slate-900/50 border border-slate-700/30">
                <dt class="text-slate-500 mb-0.5">Membro</dt>
                <dd class="font-medium text-slate-200 truncate">
                  {{ build.member?.user?.nickname || build.member?.user?.email || 'Não atribuído' }}
                </dd>
              </div>
              <div class="p-2 rounded-lg bg-slate-900/50 border border-slate-700/30">
                <dt class="text-slate-500 mb-0.5">Guilda</dt>
                <dd class="font-medium text-slate-200 truncate">{{ build.guild?.name || 'Livre' }}</dd>
              </div>
            </dl>

            <div class="p-2 rounded-lg bg-slate-900/50 border border-slate-700/30 mb-3">
              <p class="text-[11px] text-slate-500 mb-1">Itens:</p>
              <p class="text-xs text-slate-300">
                {{ (build.items || []).map((i: any) => i.name).join(', ') || 'Nenhum' }}
              </p>
            </div>

            <div v-if="build.price" class="p-2 rounded-lg bg-[#C6A95D]/10 border border-[#C6A95D]/30 mb-3">
              <p class="text-[11px] text-[#C6A95D]/70 mb-1">Valor Estimado:</p>
              <p class="text-sm font-bold text-[#C6A95D]">
                {{ Number(build.price).toLocaleString('pt-BR') }} silver
              </p>
            </div>

            <footer class="flex items-center justify-between gap-2">
              <button
                class="flex-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-200 text-xs font-semibold hover:bg-slate-700/50 hover:border-slate-500 transition-all"
                @click="editBuild(build)"
              >
                Editar
              </button>
              <button
                class="px-3 py-2 rounded-lg border border-red-500/50 bg-red-500/10 text-red-300 text-xs font-semibold hover:bg-red-500/20 hover:border-red-400 transition-all"
                @click="removeBuild(build.id)"
              >
                Remover
              </button>
            </footer>
          </div>
        </article>

        <div
          v-if="builds.length === 0"
          class="col-span-full rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 text-center"
        >
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 grid place-items-center">
              <svg class="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
            <span class="font-medium text-slate-200">Nenhuma build encontrada</span>
            <span class="text-xs text-slate-400">
              Crie sua primeira build usando o formulário ao lado
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- FORMULÁRIO -->
    <div
      class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
    >
      <header class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
          {{ editingId ? 'Editar build' : 'Nova build' }}
        </h2>
        <button
          v-if="editingId"
          class="text-sm text-[#C6A95D] hover:text-amber-400 font-semibold transition-colors"
          @click="resetForm"
        >
          Cancelar
        </button>
      </header>

      <form class="space-y-4" @submit.prevent="submit">
        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Nome</span>
          <input
            v-model="form.name"
            required
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
          />
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Membro</span>
          <select
            v-model.number="form.memberId"
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
          >
            <option :value="undefined">Selecione um membro (opcional)</option>
            <option v-for="member in members" :key="member.id" :value="member.id">
              {{ member.user?.nickname || member.user?.email || member.user?.name || 'Sem nome' }}
            </option>
          </select>
          <span v-if="members.length === 0" class="text-[11px] text-amber-400/80">
            Nenhum membro encontrado na guilda
          </span>
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Classe *</span>
          <select
            v-model="form.role"
            required
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
          >
            <option value="">Selecione uma classe</option>
            <option value="DPS">DPS</option>
            <option value="HEALER">HEALER</option>
            <option value="TANK">TANK</option>
            <option value="SUPPORT">SUPPORT</option>
          </select>
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Descrição</span>
          <textarea
            v-model="form.description"
            rows="3"
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all resize-none"
          ></textarea>
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Progresso</span>
          <input
            v-model="form.specProgress"
            placeholder="Ex: 10/100, 50/100"
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
          />
        </label>

        <!-- SEÇÃO DE ITENS COMPLETAMENTE NOVA -->
        <div class="flex flex-col gap-3">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-300">Itens do Albion</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400">
                {{ items.length }} disponíveis
              </span>
            </div>
          </div>

          <!-- Status dos itens -->
          <div v-if="items.length === 0" class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p class="text-xs text-amber-300 flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Carregando itens do Albion...
            </p>
          </div>

          <!-- Campo de busca -->
          <div class="relative">
            <input
              v-model="itemSearchQuery"
              type="text"
              placeholder="Buscar por nome, ID ou slot..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
            <span v-if="itemSearchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              {{ filteredItemsForForm.length }} resultados
            </span>
          </div>

          <!-- Lista de itens com scroll -->
          <div class="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
            <div class="max-h-72 overflow-y-auto custom-scrollbar">
              <div v-if="filteredItemsForForm.length === 0" class="p-8 text-center">
                <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-slate-400">Nenhum item encontrado</p>
                <p class="text-xs text-slate-500 mt-1">Tente uma busca diferente</p>
              </div>

              <label
                v-for="item in filteredItemsForForm"
                :key="item.id"
                class="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-800/50 last:border-0 group"
              >
                <input
                  type="checkbox"
                  :value="item.id"
                  v-model="form.itemIds"
                  class="w-4 h-4 rounded border-slate-600 text-[#C6A95D] focus:ring-[#C6A95D] focus:ring-offset-0 transition-all"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                      {{ item.name }}
                    </span>
                    <span v-if="item.slot" class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {{ item.slot }}
                    </span>
                  </div>
                  <div v-if="item.item_id || item.albion_id" class="text-xs text-slate-500 font-mono mt-0.5">
                    {{ item.item_id || item.albion_id }}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Contador de selecionados -->
          <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <span class="text-xs text-slate-400">Itens selecionados</span>
            <span class="text-sm font-bold text-[#C6A95D]">
              {{ form.itemIds.length }}
            </span>
          </div>
        </div>

        <!-- Preço Automático -->
        <div v-if="form.itemIds.length > 0" class="p-4 rounded-xl bg-[#C6A95D]/10 border border-[#C6A95D]/30">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-slate-300">Preço Estimado</span>
            <button
              type="button"
              @click="calculatePrice"
              :disabled="calculatingPrice"
              class="px-3 py-1.5 rounded-lg bg-[#C6A95D] text-slate-900 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {{ calculatingPrice ? 'Calculando...' : 'Calcular Preço' }}
            </button>
          </div>

          <div v-if="form.price" class="text-center">
            <p class="text-2xl font-bold text-[#C6A95D]">
              {{ form.price.toLocaleString('pt-BR') }} silver
            </p>
            <p class="text-xs text-slate-400 mt-1">
              Baseado em {{ form.itemIds.length }} item(ns) selecionado(s)
            </p>
          </div>
          <div v-else class="text-center text-sm text-slate-400">
            Clique em "Calcular Preço" para obter o valor estimado
          </div>

          <div v-if="priceError" class="mt-2 text-xs text-red-400">
            {{ priceError }}
          </div>
        </div>

        <label class="flex items-center gap-2">
          <input v-model="form.is_public" type="checkbox" class="accent-[#C6A95D] rounded w-4 h-4" />
          <span class="text-sm text-slate-300">Build pública (visível para outros)</span>
        </label>

        <div class="flex flex-col gap-3 mt-6">
          <button
            type="submit"
            :disabled="saving || !form.name || !form.role"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                   bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-sm
                   shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            <span
              v-if="saving"
              class="h-4 w-4 rounded-full border-2 border-slate-900/60 border-t-transparent animate-spin"
            />
            <span v-else>{{ editingId ? 'Salvar alterações' : 'Criar build' }}</span>
          </button>

          <p v-if="formError" class="text-sm text-red-400 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            {{ formError }}
          </p>
          <p v-if="message" class="text-sm text-emerald-400 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            {{ message }}
          </p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { auth } from '@/stores/auth'
import {
  BuildClassesApi,
  BuildItemsApi,
  BuildPayload,
  BuildSpecsApi,
  BuildsApi,
  MembersApi,
  AlbionDataApi,
} from '@/lib/api'

// Tipos simples usados no front
type Option = { id: number; name: string; description?: string }
type BuildItem = {
  id: number
  name: string
  slot?: string
  item_id?: string
  albion_id?: string
}

// Filtros da lista
const filters = reactive<{
  search?: string
  classId?: number
  specId?: number
  onlyMine?: boolean
}>({
  search: '',
  classId: undefined,
  specId: undefined,
  onlyMine: false,
})

// Estado geral
const classes = ref<Option[]>([])
const specs = ref<Option[]>([])
const items = ref<BuildItem[]>([])
const builds = ref<any[]>([])
const guild = ref<any>(null)
const members = ref<any[]>([])

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
const formError = ref('')
const editingId = ref<number | null>(null)
const calculatingPrice = ref(false)
const priceError = ref('')
const itemSearchQuery = ref('')

// Formulário
const form = reactive<BuildPayload & { itemIds: number[]; memberId?: number; specProgress?: string; price?: number }>({
  name: '',
  description: '',
  role: '',
  classId: 1, // Default class ID since we're using role-based selection
  specId: undefined,
  specProgress: '',
  itemIds: [],
  guildId: undefined,
  authorId: undefined,
  is_public: true,
  memberId: undefined,
  price: undefined,
})

// Specs filtradas para o formulário (baseado no classId escolhido)
const specsForForm = computed(() => {
  if (!form.classId) return specs.value
  return specs.value.filter((s: any) => s.classId === form.classId || s.class?.id === form.classId)
})

// Itens filtrados para o formulário (baseado na busca)
const filteredItemsForForm = computed(() => {
  if (!itemSearchQuery.value) return items.value
  const query = itemSearchQuery.value.toLowerCase()
  return items.value.filter((item: BuildItem) =>
    item.id.toString().toLowerCase().includes(query) ||
    item.name.toLowerCase().includes(query) ||
    (item.slot && item.slot.toLowerCase().includes(query)) ||
    (item.item_id && item.item_id.toLowerCase().includes(query)) ||
    (item.albion_id && item.albion_id.toLowerCase().includes(query))
  )
})

onMounted(async () => {
  await loadGuild()
  await Promise.all([loadClasses(), loadItems(), loadSpecs(), loadMembers()])
  await fetchBuilds()
})

async function loadClasses() {
  classes.value = await BuildClassesApi.list()
}

async function loadSpecs(classId?: number) {
  specs.value = await BuildSpecsApi.list(classId)
}

async function loadItems() {
  console.log('🔄 Loading items from API...')
  console.log('📍 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000')

  items.value = await BuildItemsApi.list()

  console.log('✅ Items loaded from API:', items.value.length, 'items')
  console.log('📦 First 5 items:', items.value.slice(0, 5).map(i => ({
    id: i.id,
    name: i.name,
    albion_id: i.albion_id,
    item_id: i.item_id,
    slot: i.slot
  })))

  if (items.value.length === 0) {
    console.warn('⚠️ No items loaded from API!')
  } else if (items.value.length < 100) {
    console.warn('⚠️ Only', items.value.length, 'items loaded. Expected 309+ items from Albion database.')
  } else {
    console.log('✅ Successfully loaded all items!')
  }
}

async function loadGuild() {
  // Usa a guilda do usuário autenticado
  guild.value = auth.guild
  if (guild.value) form.guildId = guild.value.id
  if (auth.user?.id) form.authorId = Number(auth.user.id)
}

async function loadMembers() {
  if (!guild.value?.id) {
    console.log('Nenhuma guild encontrada, não é possível carregar membros')
    return
  }
  try {
    members.value = await MembersApi.listByGuild(guild.value.id)
    console.log('Membros carregados:', JSON.stringify(members.value, null, 2))
    console.log('Total de membros:', members.value.length)
  } catch (e) {
    console.error('Erro ao carregar membros:', e)
  }
}

async function fetchBuilds() {
  loading.value = true
  error.value = ''
  try {
    const params: any = {}

    // Adicionar search apenas se não vazio
    if (filters.search) {
      params.search = filters.search
    }

    // Adicionar filtros de classe e spec
    if (filters.classId) {
      params.classId = filters.classId
    }
    if (filters.specId) {
      params.specId = filters.specId
    }

    // Se "Só minhas" estiver marcado, filtrar por autor
    if (filters.onlyMine && auth.user?.id) {
      params.authorId = auth.user.id
    }

    // Adicionar guildId para filtrar builds da guilda ou públicas
    if (guild.value?.id) {
      params.guildId = guild.value.id
    }

    builds.value = await BuildsApi.list(params)
  } catch (e: any) {
    error.value = e.message || 'Falha ao carregar builds'
  } finally {
    loading.value = false
  }
}

// Quando mudar filtro de classe
async function onClassFilterChange() {
  filters.specId = undefined
  await loadSpecs(filters.classId)
  await fetchBuilds()
}

// Resetar formulário
function resetForm() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.role = ''
  form.classId = undefined as unknown as number
  form.specId = undefined
  form.specProgress = ''
  form.itemIds = []
  form.is_public = true
  form.memberId = undefined
  form.price = undefined
  message.value = ''
  formError.value = ''
}

// Carregar dados no formulário para edição
function editBuild(build: any) {
  editingId.value = build.id
  form.name = build.name
  form.description = build.description || ''
  form.role = build.role || ''
  form.classId = build.class?.id ?? build.classId
  form.specId = build.spec?.id ?? build.specId
  form.specProgress = build.spec?.name || ''
  form.itemIds = (build.items || []).map((i: any) => i.id)
  form.is_public = build.is_public ?? true
  form.guildId = build.guild?.id ?? guild.value?.id
  form.authorId = build.author?.id ?? auth.user?.id
  form.memberId = build.member?.id ?? undefined
  form.price = build.price ?? undefined
}

// Criar / atualizar
async function submit() {
  saving.value = true
  formError.value = ''
  message.value = ''

  let payload: BuildPayload | null = null

  try {
    // Se tiver specProgress, procurar ou criar um spec com esse nome
    let specIdToUse = form.specId
    if (form.specProgress) {
      // Procurar spec existente com esse nome
      const existingSpec = specs.value.find((s: any) => s.name === form.specProgress)
      if (existingSpec) {
        specIdToUse = existingSpec.id
      } else {
        // Se não existir, criar um novo spec
        // Por enquanto, vamos apenas salvar como undefined e usar o campo description
        specIdToUse = undefined
      }
    }

    payload = {
      name: form.name,
      description: form.description,
      role: form.role,
      // classId is optional since we're using role-based selection
      specId: specIdToUse,
      itemIds: form.itemIds,
      guildId: guild.value?.id,
      authorId: Number(auth.user?.id),
      is_public: form.is_public,
      memberId: form.memberId,
      price: form.price,
    } as any

    // Remove undefined values and empty arrays to avoid validation errors
    if (payload) {
      Object.keys(payload).forEach(key => {
        const value = payload![key as keyof BuildPayload]
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          delete payload![key as keyof BuildPayload]
        }
      })
    }

    console.log('📤 Sending payload:', payload)

    if (editingId.value) {
      await BuildsApi.update(editingId.value, payload!)
      message.value = 'Build atualizada com sucesso'
    } else {
      await BuildsApi.create(payload as BuildPayload)
      message.value = 'Build criada com sucesso'
    }

    await fetchBuilds()
    resetForm()
  } catch (e: any) {
    console.error('❌ Error creating build:', e)
    console.error('❌ Error response:', e?.response?.data)
    console.error('❌ Payload sent:', payload)
    formError.value = e?.response?.data?.message || e.message || 'Erro ao salvar build'
  } finally {
    saving.value = false
  }
}

async function removeBuild(id: number) {
  if (!confirm('Deseja remover esta build?')) return
  await BuildsApi.remove(id)
  if (editingId.value === id) resetForm()
  await fetchBuilds()
}

async function calculatePrice() {
  if (form.itemIds.length === 0) {
    priceError.value = 'Selecione pelo menos um item'
    return
  }

  calculatingPrice.value = true
  priceError.value = ''
  form.price = undefined

  try {
    // Buscar os itens selecionados para obter seus albion_ids
    const selectedItems = items.value.filter(item => form.itemIds.includes(item.id))

    // Extrair os IDs do Albion (assumindo que tem um campo albion_id ou similar)
    // Se não tiver, usamos o próprio name como ID
    const albionIds = selectedItems.map(item => {
      // Tenta usar albion_id se existir, senão usa o name
      return (item as any).albion_id || (item as any).item_id || item.name
    })

    if (albionIds.length === 0) {
      priceError.value = 'Nenhum ID do Albion encontrado nos itens'
      return
    }

    // Buscar preços na API do Albion (Caerleon como referência)
    const pricesData = await AlbionDataApi.getPrices(albionIds, ['Caerleon'])

    if (!pricesData || pricesData.length === 0) {
      priceError.value = 'Não foi possível obter preços dos itens'
      return
    }

    // Calcular preço total (soma dos preços mínimos de venda)
    let totalPrice = 0
    let itemsWithPrice = 0

    for (const priceInfo of pricesData) {
      if (priceInfo.sell_price_min > 0) {
        totalPrice += priceInfo.sell_price_min
        itemsWithPrice++
      }
    }

    if (itemsWithPrice === 0) {
      priceError.value = 'Nenhum preço disponível para os itens selecionados'
      return
    }

    form.price = Math.round(totalPrice)

    if (itemsWithPrice < selectedItems.length) {
      priceError.value = `Atenção: Apenas ${itemsWithPrice} de ${selectedItems.length} itens têm preço disponível`
    }
  } catch (e: any) {
    console.error('Erro ao calcular preço:', e)
    priceError.value = e?.response?.data?.message || e?.message || 'Erro ao calcular preço'
  } finally {
    calculatingPrice.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
  transition: background 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(198, 169, 93, 0.5);
}
</style>
