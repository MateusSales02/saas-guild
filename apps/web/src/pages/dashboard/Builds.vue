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
            Filtre por classe, spec ou palavra-chave
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
                  <span v-if="build.spec" class="text-slate-600">·</span>
                  <span v-if="build.spec">{{ build.spec.name }}</span>
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
          <span class="text-sm font-semibold text-slate-300">Função / Papel</span>
          <input
            v-model="form.role"
            placeholder="Tank, healer, DPS..."
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
          />
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Descrição</span>
          <textarea
            v-model="form.description"
            rows="3"
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all resize-none"
          ></textarea>
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold text-slate-300">Classe</span>
            <select
              v-model.number="form.classId"
              @change="onFormClassChange"
              required
              class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
            >
              <option :value="undefined" disabled>Selecione</option>
              <option v-for="c in classes" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold text-slate-300">Spec</span>
            <select
              v-model.number="form.specId"
              class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm transition-all"
            >
              <option :value="undefined">Nenhuma</option>
              <option
                v-for="s in specsForForm"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>
          </label>
        </div>

        <label class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-slate-300">Itens</span>
          <select
            multiple
            v-model="form.itemIds"
            class="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-sm h-28 transition-all"
          >
            <option v-for="item in items" :key="item.id" :value="item.id">
              {{ item.name }}
              <span v-if="item.slot"> ({{ item.slot }})</span>
            </option>
          </select>
          <span class="text-[11px] text-slate-400">
            Use Ctrl/Cmd + clique para selecionar vários.
          </span>
        </label>

        <label class="flex items-center gap-2">
          <input v-model="form.is_public" type="checkbox" class="accent-[#C6A95D] rounded w-4 h-4" />
          <span class="text-sm text-slate-300">Build pública (visível para outros)</span>
        </label>

        <div class="flex flex-col gap-3 mt-6">
          <button
            type="submit"
            :disabled="saving || !form.name || !form.classId"
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
} from '@/lib/api'

// Tipos simples usados no front
type Option = { id: number; name: string; description?: string }
type BuildItem = { id: number; name: string; slot?: string }

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

// Formulário
const form = reactive<BuildPayload & { itemIds: number[]; memberId?: number }>({
  name: '',
  description: '',
  role: '',
  classId: undefined as unknown as number,
  specId: undefined,
  itemIds: [],
  guildId: undefined,
  authorId: undefined,
  is_public: true,
  memberId: undefined,
})

// Specs filtradas para o formulário (baseado no classId escolhido)
const specsForForm = computed(() => {
  if (!form.classId) return specs.value
  return specs.value.filter((s: any) => s.classId === form.classId || s.class?.id === form.classId)
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
  items.value = await BuildItemsApi.list()
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

// Quando mudar classe do formulário
async function onFormClassChange() {
  form.specId = undefined
  await loadSpecs(form.classId)
}

// Resetar formulário
function resetForm() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.role = ''
  form.classId = undefined as unknown as number
  form.specId = undefined
  form.itemIds = []
  form.is_public = true
  form.memberId = undefined
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
  form.itemIds = (build.items || []).map((i: any) => i.id)
  form.is_public = build.is_public ?? true
  form.guildId = build.guild?.id ?? guild.value?.id
  form.authorId = build.author?.id ?? auth.user?.id
  form.memberId = build.member?.id ?? undefined
}

// Criar / atualizar
async function submit() {
  saving.value = true
  formError.value = ''
  message.value = ''

  try {
    const payload: BuildPayload = {
      name: form.name,
      description: form.description,
      role: form.role,
      classId: form.classId,
      specId: form.specId,
      itemIds: form.itemIds,
      guildId: guild.value?.id,
      authorId: Number(auth.user?.id),
      is_public: form.is_public,
      memberId: form.memberId,
    }

    if (editingId.value) {
      await BuildsApi.update(editingId.value, payload)
      message.value = 'Build atualizada com sucesso'
    } else {
      await BuildsApi.create(payload)
      message.value = 'Build criada com sucesso'
    }

    await fetchBuilds()
    resetForm()
  } catch (e: any) {
    formError.value = e.message || 'Erro ao salvar build'
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
</script>
