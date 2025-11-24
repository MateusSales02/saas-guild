<template>
  <section
    class="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-5 sm:px-6 sm:py-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)]"
  >
    <!-- HEADER -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-50 flex items-center gap-2">
          <span
            class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/90 text-xs shadow-md shadow-indigo-900/50"
          >
            👥
          </span>
          Membros da Guilda
        </h2>
        <p class="mt-1 text-xs text-slate-400">
          Gerencie quem faz parte da sua guilda e os cargos de cada jogador.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 justify-between sm:justify-end">
        <!-- contador -->
        <div class="flex flex-col items-start sm:items-end text-slate-300 text-sm">
          <span class="text-[10px] uppercase tracking-wide text-slate-500">Total</span>
          <span class="text-base font-semibold text-slate-50">
            {{ members.length }}
            <span class="ml-1 text-xs font-normal text-slate-400">
              {{ members.length === 1 ? 'membro' : 'membros' }}
            </span>
          </span>
        </div>

        <!-- seleção de cargo padrão + botão -->
        <div class="flex items-center gap-2">
          <select
            v-model="quickRole"
            class="text-sm px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none"
          >
            <!-- value em inglês, label em PT-BR -->
            <option value="member">Membro</option>
            <option value="leader">Líder</option>
            <option value="officer">Oficial</option>
          </select>

          <!-- BOTÃO: sempre clicável -->
          <button
            type="button"
            @click="openModal"
            class="inline-flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg
                   border border-indigo-500/80 bg-indigo-600/90 text-white font-medium
                   shadow-md shadow-indigo-900/40 hover:bg-indigo-500 transition"
          >
            Adicionar-me
          </button>
        </div>
      </div>
    </header>

    <!-- ERRO -->
    <div
      v-if="error"
      class="mb-4 rounded-lg border border-rose-500/70 bg-rose-950/70 px-4 py-3 text-xs sm:text-sm text-rose-100 flex gap-2"
    >
      <span class="mt-0.5">⚠️</span>
      <div>
        <p class="font-medium">Ocorreu um erro.</p>
        <p class="text-rose-200/90">{{ error }}</p>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="space-y-2">
      <div class="h-3 w-24 rounded bg-slate-800/80 animate-pulse" />
      <div
        class="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/80 divide-y divide-slate-900/80"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="grid grid-cols-12 gap-3 px-4 py-3 animate-pulse"
        >
          <div class="col-span-6 sm:col-span-5 flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-slate-800/80" />
            <div class="space-y-2 flex-1">
              <div class="h-3 w-32 rounded bg-slate-800/80" />
              <div class="h-2 w-40 rounded bg-slate-900/90" />
            </div>
          </div>
          <div class="col-span-3 hidden sm:flex items-center">
            <div class="h-6 w-24 rounded bg-slate-800/80" />
          </div>
          <div class="col-span-6 sm:col-span-4 flex items-center justify-end gap-2">
            <div class="h-7 w-16 rounded bg-slate-800/80" />
            <div class="h-7 w-20 rounded bg-slate-800/80" />
          </div>
        </div>
      </div>
    </div>

    <!-- CONTEÚDO -->
    <div
      v-else
      class="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/80 shadow-lg shadow-black/40"
    >
      <table class="w-full text-xs sm:text-sm">
        <thead class="bg-slate-900/90 border-b border-slate-800/80">
          <tr class="text-left text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th class="px-4 py-2.5">Usuário</th>
            <th class="px-4 py-2.5">Cargo</th>
            <th class="px-4 py-2.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <!-- LINHAS -->
          <tr
            v-for="m in members"
            :key="m.id"
            class="border-t border-slate-900/80 hover:bg-slate-900/60 transition"
            :class="{ 'bg-slate-900/80': m.user?.id === currentUserId }"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/90 to-sky-500/90 text-xs font-semibold text-white shadow-md shadow-indigo-900/40"
                >
                  {{ (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-slate-50 truncate">
                    {{ m.user?.nickname || m.user?.email || '—' }}
                    <span
                      v-if="m.user?.id === currentUserId"
                      class="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-200"
                    >
                      Você
                    </span>
                  </div>
                  <div class="opacity-70 text-[11px] text-slate-400 truncate">
                    {{ m.user?.email || 'Sem e-mail' }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-4 py-3 align-middle">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full bg-slate-800/70 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-200"
                >
                  {{ roleLabel(m.role) }}
                </span>

                <select
                  v-if="canManage"
                  :value="m.role"
                  @change="(e: any) => updateRole(m.id, e.target.value)"
                  class="px-2 py-1 rounded bg-slate-800/40 border border-slate-700 outline-none text-[11px]"
                >
                  <option value="member">Membro</option>
                  <option value="leader">Líder</option>
                  <option value="officer">Oficial</option>
                </select>
              </div>
            </td>

            <td class="px-4 py-3 text-right align-middle">
              <button
                v-if="canManage"
                @click="removeMember(m.id)"
                class="inline-flex items-center gap-1.5 rounded-full border border-rose-500/80 bg-rose-600/10 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-600/20 hover:border-rose-400 transition"
              >
                🗑 <span class="hidden sm:inline">Remover</span>
              </button>
            </td>
          </tr>

          <!-- ESTADO VAZIO -->
          <tr v-if="members.length === 0">
            <td class="px-4 py-8 text-center text-slate-400 text-xs sm:text-sm" colspan="3">
              <div class="flex flex-col items-center gap-2">
                <span class="text-2xl">✨</span>
                <span class="font-medium text-slate-200">Nenhum membro ainda.</span>
                <span class="text-xs text-slate-400">
                  Use o botão <strong>“Adicionar-me”</strong> para adicionar o primeiro jogador.
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: Novo membro -->
    <div
      v-if="showAddMemberModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div
        class="w-[90%] max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl"
      >
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-50">Adicionar membro</h3>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-200 text-xs"
            @click="closeModal"
          >
            ✕
          </button>
        </header>

        <form class="space-y-4" @submit.prevent="submitNewMember">
          <div class="space-y-1">
            <label class="text-xs font-medium text-slate-300">Nome do jogador</label>
            <input
              v-model="newMemberName"
              type="text"
              required
              class="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-500"
              placeholder="Ex.: Guerreiro Supremo"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-slate-300">Cargo</label>
            <select
              v-model="newMemberRole"
              class="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-indigo-500"
            >
              <option value="member">Membro</option>
              <option value="leader">Líder</option>
              <option value="officer">Oficial</option>
            </select>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800/70"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving || !newMemberName.trim()"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg
                     bg-indigo-600 hover:bg-indigo-500 text-white font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                v-if="saving"
                class="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin"
              />
              <span v-else>Salvar membro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { MembersApi, postJSON } from '@/lib/api'
import { auth } from '@/stores/auth'

type GuildMemberRole = 'member' | 'leader' | 'officer'

type Member = {
  id: number
  role: GuildMemberRole
  user: { id: number; email: string; nickname?: string }
}

type PlayerUser = {
  id: number
  email: string
  nickname?: string
}

const guild = computed(() => auth.guild)
const members = ref<Member[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')

// cargo padrão sugerido
const quickRole = ref<GuildMemberRole>('member')

// modal
const showAddMemberModal = ref(false)
const newMemberName = ref('')
const newMemberRole = ref<GuildMemberRole>('member')

const currentUserId = computed(() => {
  if (!auth.user?.id) return -1
  return Number(auth.user.id)
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (guild.value) {
      members.value = await MembersApi.listByGuild(guild.value.id)
    } else {
      error.value = 'Nenhuma guilda associada ao usuário.'
      members.value = []
    }
  } catch (e: any) {
    error.value = e.message || 'Falha ao carregar membros'
  } finally {
    loading.value = false
  }
}

async function updateRole(id: number, role: string) {
  try {
    await MembersApi.update(id, role as GuildMemberRole)
  } catch (e: any) {
    error.value = e.message || 'Falha ao atualizar cargo'
    await load()
  }
}

async function removeMember(id: number) {
  try {
    await MembersApi.remove(id)
    members.value = members.value.filter((m) => m.id !== id)
  } catch (e: any) {
    error.value = e.message || 'Falha ao remover membro'
  }
}

function openModal() {
  newMemberName.value = ''
  newMemberRole.value = quickRole.value
  showAddMemberModal.value = true
}

function closeModal() {
  if (saving.value) return
  showAddMemberModal.value = false
}

// submit do formulário de novo membro
async function submitNewMember() {
  if (!guild.value) {
    error.value = 'Crie uma guilda antes de adicionar membros.'
    return
  }
  if (!newMemberName.value.trim()) return

  saving.value = true
  error.value = ''

  try {
    // chama o endpoint /auth/create-player (apenas nickname, resto o back gera)
    const created = await postJSON<PlayerUser>('/auth/create-player', {
      nickname: newMemberName.value.trim(),
    })

    await MembersApi.add(created.id, guild.value.id, newMemberRole.value)

    showAddMemberModal.value = false
    await load()
  } catch (e: any) {
    error.value = e.message || 'Falha ao criar membro'
  } finally {
    saving.value = false
  }
}

// quem pode gerenciar cargos/remover
const canManage = computed(() => {
  if (!auth.user?.id) return false
  const myId = Number(auth.user.id)
  const me = members.value.find((m) => m.user?.id === myId)
  return me?.role === 'leader' || me?.role === 'officer'
})

function roleLabel(role: GuildMemberRole) {
  switch (role) {
    case 'leader':
      return 'Líder'
    case 'officer':
      return 'Oficial'
    default:
      return 'Membro'
  }
}
</script>
