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
            <span class="ml-1 text-xs font-normal text-slate-400">membros</span>
          </span>
        </div>

        <!-- seleção de cargo + botão -->
        <div class="flex items-center gap-2">
          <select
            v-model="quickRole"
            class="text-sm px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none"
          >
            <!-- label em PT-BR, value em inglês -->
            <option value="member">Membro</option>
            <option value="leader">Líder</option>
            <option value="officer">Oficial</option>
          </select>

          <button
            @click="addMe"
            :disabled="!guild || adding"
            class="inline-flex items-center gap-2 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-indigo-500/80 bg-indigo-600/90 text-white font-medium shadow-md shadow-indigo-900/40 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span v-if="adding" class="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
            <span>{{ adding ? 'Adicionando...' : 'Adicionar-me' }}</span>
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
        <p class="font-medium">Não foi possível carregar os membros.</p>
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
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <!-- avatar com inicial -->
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/90 to-sky-500/90 text-xs font-semibold text-white shadow-md shadow-indigo-900/40"
                >
                  {{ (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-slate-50 truncate">
                    {{ m.user?.nickname || m.user?.email }}
                  </div>
                  <div class="opacity-70 text-[11px] text-slate-400 truncate">
                    {{ m.user?.email }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-4 py-3 align-middle">
              <select
                :value="m.role"
                @change="(e: any) => updateRole(m.id, e.target.value)"
                class="px-2 py-1 rounded bg-slate-800/40 border border-slate-700 outline-none"
              >
                <option value="member">Membro</option>
                <option value="leader">Líder</option>
                <option value="officer">Oficial</option>
              </select>
            </td>

            <td class="px-4 py-3 text-right align-middle">
              <button
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
                  Use o botão <strong>“Adicionar-me”</strong> para ser o primeiro membro da guilda.
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GuildsApi, MembersApi } from '@/lib/api'
import { auth } from '@/stores/auth'

type GuildMemberRole = 'member' | 'leader' | 'officer'

type Member = {
  id: number
  role: GuildMemberRole
  user: { id: number; email: string; nickname?: string }
}

const guild = ref<any>(null)
const members = ref<Member[]>([])
const loading = ref(true)
const adding = ref(false)
const error = ref('')
const quickRole = ref<'membro' | 'líder' | 'oficial'>('membro')

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const guilds = await GuildsApi.list()
    guild.value = guilds?.[0] ?? null
    members.value = guild.value ? await MembersApi.listByGuild(guild.value.id) : []
  } catch (e: any) {
    error.value = e.message || 'Falha ao carregar membros'
  } finally {
    loading.value = false
  }
}

async function addMe() {
  if (!guild.value || !auth.user?.id) return
  adding.value = true
  error.value = ''
  try {
    await MembersApi.add(Number(auth.user.id), guild.value.id, quickRole.value)
    await load()
  } catch (e: any) {
    error.value = e.message || 'Falha ao adicionar'
  } finally {
    adding.value = false
  }
}

async function updateRole(id: number, role: string) {
  try {
    await MembersApi.update(id, role as any)
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
</script>
