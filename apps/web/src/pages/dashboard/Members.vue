<template>
  <div class="page">
    <PageHeader
      :eyebrow="guild?.name ?? 'Guilda'"
      title="Membros"
      subtitle="Gerencie quem faz parte da guilda e o cargo de cada jogador."
    >
      <template #actions>
        <button type="button" class="btn btn-primary" @click="openModal">
          <AppIcon name="plus" :size="16" />
          Adicionar membro
        </button>
      </template>
    </PageHeader>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="load">Tentar novamente</button>
    </div>

    <!-- Resumo por cargo -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <button
        v-for="r in ROLE_FILTERS"
        :key="r.value"
        type="button"
        class="stat text-left transition-colors hover:border-gold-500/25"
        :class="{ '!border-gold-500/40': roleFilter === r.value }"
        :aria-pressed="roleFilter === r.value"
        @click="roleFilter = roleFilter === r.value ? 'all' : r.value"
      >
        <p class="stat-label">
          <span class="h-1.5 w-1.5 rounded-full" :class="r.dot" />
          {{ r.plural }}
        </p>
        <p class="stat-value">
          <span v-if="loading" class="skeleton inline-block h-7 w-10 align-middle" />
          <template v-else>{{ countByRole[r.value] }}</template>
        </p>
      </button>
    </div>

    <section class="panel overflow-hidden">
      <header class="panel-header">
        <label class="relative block w-full sm:w-72">
          <span class="sr-only">Buscar membro</span>
          <AppIcon name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input v-model="search" type="search" placeholder="Buscar por nome ou e-mail" class="input !pl-9" />
        </label>
        <div class="seg" role="group" aria-label="Filtrar por cargo">
          <button type="button" class="seg-item" :aria-pressed="roleFilter === 'all'" @click="roleFilter = 'all'">
            Todos <span class="ml-1 text-slate-500">{{ members.length }}</span>
          </button>
          <button
            v-for="r in ROLE_FILTERS"
            :key="r.value"
            type="button"
            class="seg-item"
            :aria-pressed="roleFilter === r.value"
            @click="roleFilter = r.value"
          >
            {{ r.plural }}
          </button>
        </div>
      </header>

      <!-- Carregando -->
      <div v-if="loading" class="divide-y divide-white/[0.04]">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-5 py-4">
          <div class="skeleton h-9 w-9 rounded-full" />
          <div class="flex-1 space-y-2">
            <div class="skeleton h-3 w-36" />
            <div class="skeleton h-2.5 w-48" />
          </div>
          <div class="skeleton h-6 w-20" />
        </div>
      </div>

      <EmptyState
        v-else-if="members.length === 0"
        icon="users"
        title="Nenhum membro ainda"
        text="Adicione o primeiro jogador para começar a organizar a guilda."
      >
        <button type="button" class="btn btn-secondary btn-sm" @click="openModal">
          <AppIcon name="plus" :size="14" /> Adicionar membro
        </button>
      </EmptyState>

      <EmptyState
        v-else-if="filtered.length === 0"
        icon="search"
        title="Nenhum membro encontrado"
        text="Tente outro nome ou remova o filtro de cargo."
      />

      <div v-else class="overflow-x-auto">
        <table class="table min-w-[560px]">
          <thead>
            <tr>
              <th scope="col">Jogador</th>
              <th scope="col">Cargo</th>
              <th scope="col" class="!text-right"><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filtered" :key="m.id">
              <td>
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                    :class="m.role === 'leader' ? 'border-gold-500/40 bg-gold-500/10 text-gold-200' : 'border-white/10 bg-ink-700 text-slate-200'"
                  >
                    {{ initial(m) }}
                  </span>
                  <div class="min-w-0">
                    <p class="flex items-center gap-2 truncate font-medium text-slate-100">
                      {{ m.user?.nickname || m.user?.email || '—' }}
                      <span v-if="m.user?.id === currentUserId" class="badge badge-gold">Você</span>
                    </p>
                    <p class="truncate text-xs text-slate-500">{{ m.user?.email || 'Sem e-mail' }}</p>
                  </div>
                </div>
              </td>
              <td>
                <select
                  v-if="canManage"
                  :value="m.role"
                  class="select input-sm w-36"
                  :aria-label="`Cargo de ${m.user?.nickname || m.user?.email}`"
                  :disabled="updatingId === m.id"
                  @change="updateRole(m, ($event.target as HTMLSelectElement).value as GuildMemberRole)"
                >
                  <option v-for="r in ROLE_FILTERS" :key="r.value" :value="r.value">{{ r.label }}</option>
                </select>
                <span v-else class="badge" :class="roleBadge(m.role)">{{ roleLabel(m.role) }}</span>
              </td>
              <td class="text-right">
                <button
                  v-if="canManage && m.user?.id !== currentUserId"
                  type="button"
                  class="btn btn-ghost btn-sm hover:!text-rose-300"
                  :aria-label="`Remover ${m.user?.nickname || m.user?.email}`"
                  @click="removeMember(m)"
                >
                  <AppIcon name="trash" :size="15" />
                  <span class="hidden sm:inline">Remover</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="!loading && members.length" class="panel-footer">
        <span>{{ filtered.length }} de {{ members.length }} {{ members.length === 1 ? 'membro' : 'membros' }}</span>
        <span v-if="!canManage" class="flex items-center gap-1.5"><AppIcon name="lock" :size="12" /> Só líderes e oficiais podem alterar cargos</span>
      </footer>
    </section>

    <!-- MODAL: Novo membro -->
    <Teleport to="body">
      <div v-if="showAddMemberModal" class="modal-backdrop" @mousedown.self="closeModal" @keydown.esc="closeModal">
        <form class="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="add-member-title" @submit.prevent="submitNewMember">
          <header class="panel-header">
            <div>
              <h2 id="add-member-title" class="section-title">Adicionar membro</h2>
              <p class="panel-subtitle">O jogador entra direto na {{ guild?.name ?? 'guilda' }}</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="closeModal">
              <AppIcon name="x" />
            </button>
          </header>

          <div class="space-y-4 p-5">
            <div>
              <label for="new-member-name" class="label">Nome do jogador</label>
              <input
                id="new-member-name"
                ref="nameInput"
                v-model="newMemberName"
                type="text"
                required
                maxlength="40"
                class="input"
                placeholder="Nick no Albion"
              />
            </div>
            <div>
              <p class="label">Cargo</p>
              <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Cargo">
                <button
                  v-for="r in ROLE_FILTERS"
                  :key="r.value"
                  type="button"
                  role="radio"
                  :aria-checked="newMemberRole === r.value"
                  class="inset flex flex-col items-start gap-1 p-3 text-left transition-colors hover:border-white/20"
                  :class="{ '!border-gold-500/50 !bg-gold-500/[0.07]': newMemberRole === r.value }"
                  @click="newMemberRole = r.value"
                >
                  <span class="text-sm font-medium text-slate-100">{{ r.label }}</span>
                  <span class="text-[11px] leading-snug text-slate-500">{{ r.hint }}</span>
                </button>
              </div>
            </div>
          </div>

          <footer class="flex justify-end gap-2 border-t border-white/[0.06] p-4">
            <button type="button" class="btn btn-ghost" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving || !newMemberName.trim()">
              <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
              {{ saving ? 'Salvando...' : 'Adicionar' }}
            </button>
          </footer>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { MembersApi, postJSON } from '@/lib/api'
import { friendlyError } from '@/lib/errors'
import { confirmAction, toast } from '@/lib/toast'
import { normalizeText } from '@/lib/market'
import { auth } from '@/stores/auth'

type GuildMemberRole = 'member' | 'leader' | 'officer'
type Member = { id: number; role: GuildMemberRole; user: { id: number; email: string; nickname?: string } }
type PlayerUser = { id: number; email: string; nickname?: string }

const ROLE_FILTERS: Array<{ value: GuildMemberRole; label: string; plural: string; hint: string; dot: string }> = [
  { value: 'leader', label: 'Líder', plural: 'Líderes', hint: 'Controle total', dot: 'bg-gold-400' },
  { value: 'officer', label: 'Oficial', plural: 'Oficiais', hint: 'Gerencia membros', dot: 'bg-sky-400' },
  { value: 'member', label: 'Membro', plural: 'Membros', hint: 'Acesso padrão', dot: 'bg-slate-400' },
]

const guild = computed(() => auth.guild)
const members = ref<Member[]>([])
const loading = ref(true)
const saving = ref(false)
const updatingId = ref<number | null>(null)
const error = ref('')
const search = ref('')
const roleFilter = ref<GuildMemberRole | 'all'>('all')

const showAddMemberModal = ref(false)
const newMemberName = ref('')
const newMemberRole = ref<GuildMemberRole>('member')
const nameInput = ref<HTMLInputElement | null>(null)

const currentUserId = computed(() => (auth.user?.id ? Number(auth.user.id) : -1))

const countByRole = computed(() => {
  const counts: Record<GuildMemberRole, number> = { leader: 0, officer: 0, member: 0 }
  for (const m of members.value) counts[m.role in counts ? m.role : 'member']++
  return counts
})

// Ordem: você primeiro, depois por cargo e nome
const ROLE_ORDER: Record<string, number> = { leader: 0, officer: 1, member: 2 }
const filtered = computed(() => {
  const needle = normalizeText(search.value)
  return members.value
    .filter((m) => roleFilter.value === 'all' || m.role === roleFilter.value)
    .filter((m) => !needle || normalizeText(`${m.user?.nickname ?? ''} ${m.user?.email ?? ''}`).includes(needle))
    .sort(
      (a, b) =>
        Number(b.user?.id === currentUserId.value) - Number(a.user?.id === currentUserId.value) ||
        (ROLE_ORDER[a.role] ?? 3) - (ROLE_ORDER[b.role] ?? 3) ||
        (a.user?.nickname ?? '').localeCompare(b.user?.nickname ?? ''),
    )
})

const canManage = computed(() => {
  const me = members.value.find((m) => m.user?.id === currentUserId.value)
  return me?.role === 'leader' || me?.role === 'officer'
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    members.value = guild.value ? await MembersApi.listByGuild(guild.value.id) : []
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar os membros.')
  } finally {
    loading.value = false
  }
}

async function updateRole(member: Member, role: GuildMemberRole) {
  const previous = member.role
  member.role = role
  updatingId.value = member.id
  try {
    await MembersApi.update(member.id, role)
    toast('Cargo atualizado', { text: `${member.user?.nickname ?? 'Jogador'} agora é ${roleLabel(role).toLowerCase()}.` })
  } catch (e) {
    member.role = previous
    toast('Não foi possível alterar o cargo', { tone: 'error', text: friendlyError(e) })
  } finally {
    updatingId.value = null
  }
}

async function removeMember(member: Member) {
  const name = member.user?.nickname || member.user?.email || 'este jogador'
  const ok = await confirmAction({
    title: `Remover ${name} da guilda?`,
    text: 'O jogador perde acesso ao painel da guilda. Você pode adicioná-lo novamente depois.',
    confirmLabel: 'Remover',
    danger: true,
  })
  if (!ok) return
  try {
    await MembersApi.remove(member.id)
    members.value = members.value.filter((m) => m.id !== member.id)
    toast('Membro removido', { text: name })
  } catch (e) {
    toast('Não foi possível remover', { tone: 'error', text: friendlyError(e) })
  }
}

function openModal() {
  newMemberName.value = ''
  newMemberRole.value = 'member'
  showAddMemberModal.value = true
  nextTick(() => nameInput.value?.focus())
}

function closeModal() {
  if (!saving.value) showAddMemberModal.value = false
}

async function submitNewMember() {
  if (!guild.value) {
    toast('Crie uma guilda antes de adicionar membros', { tone: 'error' })
    return
  }
  const nickname = newMemberName.value.trim()
  if (!nickname) return

  saving.value = true
  try {
    // O back gera e-mail e senha a partir do nickname
    const created = await postJSON<PlayerUser>('/auth/create-player', { nickname })
    await MembersApi.add(created.id, guild.value.id, newMemberRole.value)
    showAddMemberModal.value = false
    toast('Membro adicionado', { text: `${nickname} entrou na guilda.` })
    await load()
  } catch (e) {
    toast('Não foi possível adicionar', { tone: 'error', text: friendlyError(e) })
  } finally {
    saving.value = false
  }
}

function initial(m: Member) {
  return (m.user?.nickname || m.user?.email || '?').charAt(0).toUpperCase()
}

function roleLabel(role: GuildMemberRole) {
  return ROLE_FILTERS.find((r) => r.value === role)?.label ?? 'Membro'
}

function roleBadge(role: GuildMemberRole) {
  return role === 'leader' ? 'badge-gold' : role === 'officer' ? 'badge-info' : 'badge-neutral'
}
</script>
