<template>
  <section
    class="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl px-4 py-5 sm:px-6 sm:py-6 shadow-2xl"
  >
    <!-- HEADER -->
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
          Membros da Guilda
        </h2>
        <p class="mt-2 text-sm text-slate-400">
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
            class="text-sm px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
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
            class="group inline-flex items-center gap-2 text-xs sm:text-sm px-4 py-2 rounded-lg
                   bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold
                   shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105 transition-all duration-300"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
            </svg>
            Adicionar Membro
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
      class="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30 shadow-lg"
    >
      <table class="w-full text-xs sm:text-sm">
        <thead class="bg-slate-800/60 border-b border-slate-700/50">
          <tr class="text-left text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
            <th class="px-4 py-3.5">Usuário</th>
            <th class="px-4 py-3.5">Cargo</th>
            <th class="px-4 py-3.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <!-- LINHAS -->
          <tr
            v-for="m in members"
            :key="m.id"
            class="border-t border-slate-700/30 hover:bg-slate-800/50 transition-all duration-200"
            :class="{ 'bg-indigo-500/10 border-indigo-500/30': m.user?.id === currentUserId }"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
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
                  class="inline-flex items-center rounded-lg bg-slate-700/50 border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200"
                  :class="{
                    'bg-[#C6A95D]/20 border-[#C6A95D]/40 text-[#C6A95D]': m.role === 'leader',
                    'bg-indigo-500/20 border-indigo-500/40 text-indigo-300': m.role === 'officer'
                  }"
                >
                  {{ roleLabel(m.role) }}
                </span>

                <select
                  v-if="canManage"
                  :value="m.role"
                  @change="(e: any) => updateRole(m.id, e.target.value)"
                  class="px-2 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none text-xs transition-all"
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
                class="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 transition-all duration-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span class="hidden sm:inline">Remover</span>
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        class="relative w-[90%] max-w-md rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 p-6 shadow-2xl animate-fade-in-up"
      >
        <!-- Glow Effect -->
        <div class="absolute -inset-1 bg-gradient-to-r from-[#C6A95D]/20 to-indigo-500/20 rounded-2xl blur-xl opacity-50" />

        <div class="relative">
          <header class="mb-6 flex items-center justify-between">
            <h3 class="text-xl font-bold bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
              Adicionar Membro
            </h3>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-200 transition-colors"
              @click="closeModal"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </header>

          <form class="space-y-5" @submit.prevent="submitNewMember">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-300">Nome do jogador</label>
              <input
                v-model="newMemberName"
                type="text"
                required
                class="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
                placeholder="Ex.: Guerreiro Supremo"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-300">Cargo</label>
              <select
                v-model="newMemberRole"
                class="w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3 text-sm text-slate-100 focus:border-[#C6A95D] focus:ring-2 focus:ring-[#C6A95D]/20 outline-none transition-all"
              >
                <option value="member">Membro</option>
                <option value="leader">Líder</option>
                <option value="officer">Oficial</option>
              </select>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2.5 text-sm rounded-xl border-2 border-slate-600 bg-slate-800/30 text-slate-200 font-semibold hover:bg-slate-800/50 hover:border-slate-500 transition-all"
                @click="closeModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving || !newMemberName.trim()"
                class="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl
                       bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold
                       shadow-lg shadow-[#C6A95D]/30 hover:shadow-[#C6A95D]/50 hover:scale-105
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                <span
                  v-if="saving"
                  class="h-4 w-4 rounded-full border-2 border-slate-900/60 border-t-transparent animate-spin"
                />
                <span v-else>Salvar Membro</span>
              </button>
            </div>
          </form>
        </div>
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
      // Se não houver guilda, simplesmente não carrega membros
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

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
</style>
