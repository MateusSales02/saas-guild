<template>
  <section class="grid lg:grid-cols-[2fr_1fr] gap-6">
    <!-- LISTA DE BUILDS -->
    <div
      class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
    >
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 class="text-lg font-semibold">Builds</h2>
          <p class="text-sm opacity-70">Filtre por classe, spec ou palavra-chave</p>
        </div>

        <div class="flex flex-wrap gap-2 items-center">
          <input
            v-model="filters.search"
            @input="fetchBuilds"
            type="text"
            placeholder="Buscar"
            class="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700 outline-none text-sm"
          />

          <select
            v-model.number="filters.classId"
            @change="onClassFilterChange"
            class="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700 text-sm"
          >
            <option :value="undefined">Todas classes</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>

          <select
            v-model.number="filters.specId"
            @change="fetchBuilds"
            class="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700 text-sm"
          >
            <option :value="undefined">Todas specs</option>
            <option v-for="s in specs" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>

          <label class="flex items-center gap-1 text-xs cursor-pointer">
            <input v-model="filters.onlyMine" type="checkbox" class="accent-[#C6A95D]" />
            Só minhas
          </label>
        </div>
      </header>

      <div v-if="loading" class="text-sm opacity-70">Carregando builds...</div>
      <div v-if="error" class="text-sm text-red-400">{{ error }}</div>

      <div v-if="!loading && !error" class="grid md:grid-cols-2 gap-4">
        <article
          v-for="build in builds"
          :key="build.id"
          class="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/40 flex flex-col justify-between"
        >
          <header class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-sm">{{ build.name }}</h3>
              <p class="text-xs opacity-70">
                {{ build.role || 'Sem função' }} ·
                {{ build.class?.name || 'Classe indefinida' }}
                <span v-if="build.spec"> · {{ build.spec.name }}</span>
              </p>
            </div>
            <span
              class="px-2 py-0.5 rounded-lg text-[10px]"
              :class="build.is_public ? 'bg-emerald-900/40 text-emerald-200' : 'bg-slate-800 text-slate-200'"
            >
              {{ build.is_public ? 'Pública' : 'Privada' }}
            </span>
          </header>

          <p v-if="build.description" class="mt-2 text-xs opacity-80 line-clamp-3">
            {{ build.description }}
          </p>

          <dl class="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <dt class="opacity-60">Membro</dt>
              <dd class="font-medium">
                {{ build.member?.user?.nickname || build.member?.user?.email || 'Não atribuído' }}
              </dd>
            </div>
            <div>
              <dt class="opacity-60">Guilda</dt>
              <dd class="font-medium">{{ build.guild?.name || 'Livre' }}</dd>
            </div>
          </dl>

          <p class="mt-2 text-[11px] opacity-70">
            Itens:
            {{ (build.items || []).map((i: any) => i.name).join(', ') || 'Nenhum' }}
          </p>

          <footer class="mt-3 flex items-center justify-between gap-2 text-xs">
            <button
              class="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800"
              @click="editBuild(build)"
            >
              Editar
            </button>
            <button
              class="px-3 py-1 rounded-lg border border-red-700 hover:bg-red-800 text-red-100"
              @click="removeBuild(build.id)"
            >
              Remover
            </button>
          </footer>
        </article>

        <p v-if="builds.length === 0" class="text-sm opacity-70">
          Nenhuma build encontrada.
        </p>
      </div>
    </div>

    <!-- FORMULÁRIO -->
    <div
      class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
    >
      <header class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">
          {{ editingId ? 'Editar build' : 'Nova build' }}
        </h2>
        <button
          v-if="editingId"
          class="text-sm text-slate-300 underline"
          @click="resetForm"
        >
          Cancelar
        </button>
      </header>

      <form class="space-y-3" @submit.prevent="submit">
        <label class="flex flex-col gap-1 text-sm">
          <span>Nome</span>
          <input
            v-model="form.name"
            required
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
          />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span>Membro</span>
          <select
            v-model.number="form.memberId"
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
          >
            <option :value="undefined">Selecione um membro (opcional)</option>
            <option v-for="member in members" :key="member.id" :value="member.id">
              {{ member.user?.nickname || member.user?.email || member.user?.name || 'Sem nome' }}
            </option>
          </select>
          <span v-if="members.length === 0" class="text-[11px] opacity-60 text-yellow-400">
            Nenhum membro encontrado na guilda
          </span>
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span>Função / Papel</span>
          <input
            v-model="form.role"
            placeholder="Tank, healer, DPS..."
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
          />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span>Descrição</span>
          <textarea
            v-model="form.description"
            rows="3"
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
          ></textarea>
        </label>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <label class="flex flex-col gap-1">
            <span>Classe</span>
            <select
              v-model.number="form.classId"
              @change="onFormClassChange"
              required
              class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
            >
              <option :value="undefined" disabled>Selecione</option>
              <option v-for="c in classes" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span>Spec</span>
            <select
              v-model.number="form.specId"
              class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
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

        <label class="flex flex-col gap-1 text-sm">
          <span>Itens</span>
          <select
            multiple
            v-model="form.itemIds"
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 h-28"
          >
            <option v-for="item in items" :key="item.id" :value="item.id">
              {{ item.name }}
              <span v-if="item.slot"> ({{ item.slot }})</span>
            </option>
          </select>
          <span class="text-[11px] opacity-60">
            Use Ctrl/Cmd + clique para selecionar vários.
          </span>
        </label>

        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.is_public" type="checkbox" class="accent-[#C6A95D]" />
          Build pública (visível para outros)
        </label>

        <div class="flex items-center gap-3 mt-2">
          <button
            type="submit"
            :disabled="saving || !form.name || !form.classId"
            class="px-4 py-2 rounded-lg bg-[#C6A95D] text-slate-900 text-sm disabled:opacity-50"
          >
            {{ saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar build' }}
          </button>
          <p v-if="formError" class="text-sm text-red-400">{{ formError }}</p>
          <p v-if="message" class="text-sm text-emerald-400">{{ message }}</p>
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
  GuildsApi,
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
  const guilds = await GuildsApi.list()
  guild.value = guilds?.[0] ?? null
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
