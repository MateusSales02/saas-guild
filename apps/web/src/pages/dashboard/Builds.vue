<template>
  <section class="grid lg:grid-cols-[2fr_1fr] gap-6">
    <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
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
            class="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700 outline-none text-sm"
          >
            <option :value="undefined">Todas as classes</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
          <select
            v-model.number="filters.specId"
            @change="fetchBuilds"
            class="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700 outline-none text-sm"
          >
            <option :value="undefined">Todas as specs</option>
            <option v-for="spec in filteredSpecs" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
          </select>
        </div>
      </header>

      <p v-if="error" class="text-sm text-red-400 mb-2">{{ error }}</p>
      <div v-if="loading" class="text-sm opacity-80">Carregando builds…</div>

      <div v-else class="space-y-3">
        <article
          v-for="build in builds"
          :key="build.id"
          class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/40"
        >
          <header class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold">{{ build.name }}</h3>
                <span v-if="!build.is_public" class="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">Privada</span>
              </div>
              <p class="text-sm opacity-80">{{ build.description || 'Sem descrição' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1 rounded-lg border border-slate-600 hover:bg-slate-800 text-sm"
                @click="startEdit(build)"
              >
                Editar
              </button>
              <button
                class="px-3 py-1 rounded-lg border border-red-600 hover:bg-red-700 text-sm text-red-200"
                @click="removeBuild(build.id)"
              >
                Excluir
              </button>
            </div>
          </header>
          <dl class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm mt-3">
            <div>
              <dt class="opacity-60 text-xs">Classe</dt>
              <dd class="font-medium">{{ build.class?.name || 'N/A' }}</dd>
            </div>
            <div>
              <dt class="opacity-60 text-xs">Especialização</dt>
              <dd class="font-medium">{{ build.spec?.name || 'N/A' }}</dd>
            </div>
            <div>
              <dt class="opacity-60 text-xs">Guilda</dt>
              <dd class="font-medium">{{ build.guild?.name || 'Livre' }}</dd>
            </div>
          </dl>
          <div class="mt-3 text-xs opacity-70">
            Itens: {{ (build.items || []).map((i) => i.name).join(', ') || 'Nenhum' }}
          </div>
        </article>

        <p v-if="builds.length === 0" class="text-sm opacity-70">Nenhuma build encontrada.</p>
      </div>
    </div>

    <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
      <header class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">{{ editingId ? 'Editar build' : 'Nova build' }}</h2>
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
          <input v-model="form.name" required class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700" />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span>Descrição</span>
          <textarea
            v-model="form.description"
            rows="3"
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
          ></textarea>
        </label>

        <div class="grid sm:grid-cols-2 gap-3">
          <label class="flex flex-col gap-1 text-sm">
            <span>Classe</span>
            <select
              v-model.number="form.classId"
              required
              @change="loadSpecs(form.classId)"
              class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
            >
              <option :value="undefined">Selecione</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span>Especialização</span>
            <select
              v-model.number="form.specId"
              class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700"
            >
              <option :value="undefined">Opcional</option>
              <option v-for="spec in filteredSpecs" :key="spec.id" :value="spec.id">{{ spec.name }}</option>
            </select>
          </label>
        </div>

        <label class="flex flex-col gap-1 text-sm">
          <span>Itens</span>
          <select
            v-model="form.itemIds"
            multiple
            class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 h-28"
          >
            <option v-for="it in items" :key="it.id" :value="it.id">{{ it.name }} ({{ it.slot || 'slot livre' }})</option>
          </select>
        </label>

        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.is_public" />
          Build pública (visível para todos)
        </label>

        <p v-if="message" class="text-green-400 text-sm">{{ message }}</p>
        <p v-if="formError" class="text-red-400 text-sm">{{ formError }}</p>

        <button
          type="submit"
          class="w-full py-2 rounded-lg bg-[#C6A95D] text-slate-900 font-semibold shadow-md disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : editingId ? 'Atualizar build' : 'Criar build' }}
        </button>
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
} from '@/lib/api'

type Option = { id: number; name: string; description?: string }
type SpecOption = Option & { class?: Option; classId?: number }
type BuildItem = { id: number; name: string; slot?: string }
type Build = {
  id: number
  name: string
  description?: string
  class?: Option
  spec?: SpecOption
  guild?: { id: number; name: string } | null
  author?: { id: number; email: string } | null
  items?: BuildItem[]
  is_public: boolean
}

const classes = ref<Option[]>([])
const specs = ref<SpecOption[]>([])
const items = ref<BuildItem[]>([])
const builds = ref<Build[]>([])
const guild = ref<any>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const message = ref('')
const formError = ref('')
const editingId = ref<number | null>(null)
const filters = reactive<{ search?: string; classId?: number; specId?: number }>({})

const form = reactive<BuildPayload>({
  name: '',
  description: '',
  classId: undefined as any,
  specId: undefined,
  itemIds: [],
  guildId: undefined,
  authorId: undefined,
  is_public: true,
})

const filteredSpecs = computed(() => {
  if (!form.classId) return specs.value
  return specs.value.filter((s) => s.class?.id === form.classId || (s as any).classId === form.classId)
})

onMounted(async () => {
  await Promise.all([loadClasses(), loadItems(), loadGuild()])
  await loadSpecs()
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
  if (auth.user?.id) form.authorId = auth.user.id
}

async function fetchBuilds() {
  loading.value = true
  error.value = ''
  try {
    const params: any = { ...filters }
    if (guild.value?.id) params.guildId = guild.value.id
    Object.keys(params).forEach((key) => params[key] === undefined && delete params[key])
    builds.value = await BuildsApi.list(params)
  } catch (e: any) {
    error.value = e.message || 'Falha ao carregar builds'
  } finally {
    loading.value = false
  }
}

function onClassFilterChange() {
  filters.specId = undefined
  fetchBuilds()
}

function startEdit(build: Build) {
  editingId.value = build.id
  form.name = build.name
  form.description = build.description || ''
  form.classId = build.class?.id as any
  form.specId = build.spec?.id
  form.itemIds = (build.items || []).map((i) => i.id)
  form.is_public = build.is_public
  form.guildId = build.guild?.id || guild.value?.id
  form.authorId = build.author?.id || auth.user?.id
  if (build.class?.id) loadSpecs(build.class.id)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetForm() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.classId = undefined as any
  form.specId = undefined
  form.itemIds = []
  form.is_public = true
  form.guildId = guild.value?.id
  form.authorId = auth.user?.id
  message.value = ''
  formError.value = ''
}

async function submit() {
  saving.value = true
  formError.value = ''
  message.value = ''
  try {
    if (!form.classId) throw new Error('Selecione uma classe')

    if (editingId.value) {
      await BuildsApi.update(editingId.value, form)
      message.value = 'Build atualizada com sucesso'
    } else {
      await BuildsApi.create(form as BuildPayload)
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
