<template>
  <section
    class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
  >
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Membros</h2>

      <div class="flex items-center gap-2">
        <select
          v-model="quickRole"
          class="text-sm px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 outline-none"
        >
          <option value="membro">Membro</option>
          <option value="líder">Líder</option>
          <option value="oficial">Oficial</option>
        </select>
        <button
          @click="addMe"
          :disabled="!guild || adding"
          class="text-sm px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50"
        >
          {{ adding ? 'Adicionando...' : 'Adicionar-me' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="text-red-400 text-sm mb-3">{{ error }}</p>

    <div v-if="loading" class="opacity-80">Carregando membros…</div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table class="w-full text-sm">
        <thead class="bg-slate-900/40">
          <tr>
            <th class="text-left p-3">Usuário</th>
            <th class="text-left p-3">Cargo</th>
            <th class="text-right p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.id" class="border-t border-slate-800/50">
            <td class="p-3">
              <div class="font-medium">{{ m.user?.nickname || m.user?.email }}</div>
              <div class="opacity-70 text-xs">{{ m.user?.email }}</div>
            </td>
            <td class="p-3">
              <select
                :value="m.role"
                @change="(e: any) => updateRole(m.id, e.target.value)"
                class="px-2 py-1 rounded bg-slate-800/40 border border-slate-700 outline-none"
              >
                <option value="membro">Membro</option>
                <option value="líder">Líder</option>
                <option value="oficial">Oficial</option>
              </select>
            </td>
            <td class="p-3 text-right">
              <button
                @click="removeMember(m.id)"
                class="px-3 py-1 rounded border border-red-600 hover:bg-red-700 text-red-200"
              >
                Remover
              </button>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td class="p-4 text-center opacity-70" colspan="3">Nenhum membro ainda.</td>
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

type Member = { id: number; role: string; user: { id: number; email: string; nickname?: string } }

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
    // opcional: feedback visual
  } catch (e: any) {
    error.value = e.message || 'Falha ao atualizar cargo'
    await load() // volta ao estado do servidor
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
