<template>
  <div class="page">
    <PageHeader eyebrow="Administração" title="Auditoria" subtitle="Registro de todas as ações realizadas no sistema." />

    <!-- Filtros -->
    <div class="panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
      <div>
        <label for="audit-action" class="label">Ação</label>
        <select id="audit-action" v-model="filters.action" class="select" @change="reload">
          <option value="">Todas</option>
          <option v-for="(meta, key) in ACTIONS" :key="key" :value="key">{{ meta.label }}</option>
        </select>
      </div>
      <div>
        <label for="audit-entity" class="label">Entidade</label>
        <select id="audit-entity" v-model="filters.entityType" class="select" @change="reload">
          <option value="">Todas</option>
          <option v-for="(label, key) in ENTITIES" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div>
        <label for="audit-start" class="label">De</label>
        <input id="audit-start" v-model="filters.startDate" type="date" class="input" @change="reload" />
      </div>
      <div>
        <label for="audit-end" class="label">Até</label>
        <input id="audit-end" v-model="filters.endDate" type="date" class="input" @change="reload" />
      </div>
      <button type="button" class="btn btn-ghost" :disabled="!hasFilters" @click="clearFilters">
        <AppIcon name="x" :size="15" /> Limpar
      </button>
    </div>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="loadLogs">Tentar novamente</button>
    </div>

    <section class="panel overflow-hidden">
      <div v-if="loading" class="space-y-2 p-5">
        <div v-for="i in 6" :key="i" class="skeleton h-11" />
      </div>

      <EmptyState
        v-else-if="!logs.length"
        icon="list"
        title="Nenhum registro encontrado"
        :text="hasFilters ? 'Nenhuma ação corresponde aos filtros escolhidos.' : 'As ações realizadas no sistema aparecerão aqui.'"
      />

      <div v-else class="overflow-x-auto">
        <table class="table min-w-[760px]">
          <thead>
            <tr>
              <th scope="col">Quando</th>
              <th scope="col">Usuário</th>
              <th scope="col">Ação</th>
              <th scope="col">Entidade</th>
              <th scope="col">IP</th>
              <th scope="col"><span class="sr-only">Detalhes</span></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="log in logs" :key="log.id">
              <tr>
                <td class="whitespace-nowrap">
                  <span class="block text-slate-200">{{ relative(log.created_at) }}</span>
                  <span class="text-xs text-slate-500">{{ formatDate(log.created_at) }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <span class="flex items-center gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-ink-700 text-[10px] font-semibold text-slate-300">
                      {{ (log.user_email || 'S').charAt(0).toUpperCase() }}
                    </span>
                    <span class="text-slate-300">{{ log.user_email || 'Sistema' }}</span>
                  </span>
                </td>
                <td>
                  <span class="badge" :class="actionMeta(log.action).badge">{{ actionMeta(log.action).label }}</span>
                </td>
                <td class="whitespace-nowrap text-slate-300">
                  {{ ENTITIES[log.entity_type] ?? log.entity_type }}
                  <span v-if="log.entity_id" class="text-slate-500">#{{ log.entity_id }}</span>
                </td>
                <td class="whitespace-nowrap font-mono text-xs text-slate-500">{{ log.ip_address || '—' }}</td>
                <td class="text-right">
                  <button
                    v-if="log.details"
                    type="button"
                    class="btn btn-ghost btn-sm"
                    :aria-expanded="expanded === log.id"
                    @click="expanded = expanded === log.id ? null : log.id"
                  >
                    Detalhes
                    <AppIcon name="chevron-down" :size="14" class="transition-transform" :class="{ 'rotate-180': expanded === log.id }" />
                  </button>
                </td>
              </tr>
              <tr v-if="expanded === log.id">
                <td colspan="6" class="!bg-ink-850">
                  <pre class="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-400">{{ prettyDetails(log.details) }}</pre>
                  <p v-if="log.user_agent" class="mt-2 text-[11px] text-slate-600">{{ log.user_agent }}</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <footer v-if="!loading && (logs.length || filters.offset > 0)" class="panel-footer">
        <span>
          Registros {{ filters.offset + 1 }}–{{ filters.offset + logs.length }}
        </span>
        <div class="flex gap-2">
          <button type="button" class="btn btn-secondary btn-sm" :disabled="filters.offset === 0" @click="previousPage">
            <AppIcon name="arrow-left" :size="14" /> Anterior
          </button>
          <button type="button" class="btn btn-secondary btn-sm" :disabled="logs.length < filters.limit" @click="nextPage">
            Próxima <AppIcon name="arrow-right" :size="14" />
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { api } from '@/lib/api'
import { friendlyError } from '@/lib/errors'

interface AuditLog {
  id: number
  user_id: number | null
  user_email: string | null
  action: string
  entity_type: string
  entity_id: number | null
  details: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

const ACTIONS: Record<string, { label: string; badge: string }> = {
  CREATE: { label: 'Criação', badge: 'badge-success' },
  UPDATE: { label: 'Atualização', badge: 'badge-info' },
  DELETE: { label: 'Exclusão', badge: 'badge-danger' },
  LOGIN: { label: 'Login', badge: 'badge-gold' },
  LOGOUT: { label: 'Logout', badge: 'badge-neutral' },
  EXPORT: { label: 'Exportação', badge: 'badge-warning' },
  VIEW: { label: 'Visualização', badge: 'badge-neutral' },
}
const ENTITIES: Record<string, string> = {
  User: 'Usuário',
  Guild: 'Guilda',
  Event: 'Evento',
  Finance: 'Finanças',
  Build: 'Build',
}

const logs = ref<AuditLog[]>([])
const loading = ref(true)
const error = ref('')
const expanded = ref<number | null>(null)
const filters = ref({ action: '', entityType: '', startDate: '', endDate: '', limit: 50, offset: 0 })

const hasFilters = computed(() => !!(filters.value.action || filters.value.entityType || filters.value.startDate || filters.value.endDate))

async function loadLogs() {
  loading.value = true
  error.value = ''
  expanded.value = null
  try {
    const { action, entityType, startDate, endDate, limit, offset } = filters.value
    const params: Record<string, unknown> = { limit, offset }
    if (action) params.action = action
    if (entityType) params.entityType = entityType
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const response = await api.get('/audit', { params })
    logs.value = response.data?.logs ?? []
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar a auditoria.')
  } finally {
    loading.value = false
  }
}

function reload() {
  filters.value.offset = 0
  loadLogs()
}

function clearFilters() {
  filters.value = { action: '', entityType: '', startDate: '', endDate: '', limit: 50, offset: 0 }
  loadLogs()
}

function previousPage() {
  filters.value.offset = Math.max(0, filters.value.offset - filters.value.limit)
  loadLogs()
}

function nextPage() {
  filters.value.offset += filters.value.limit
  loadLogs()
}

function actionMeta(action: string) {
  return ACTIONS[action] ?? { label: action, badge: 'badge-neutral' }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function relative(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  const mins = Math.round(diff / 60_000)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  return rtf.format(Math.round(hours / 24), 'day')
}

/** Detalhes costumam vir como JSON em texto: formata para leitura */
function prettyDetails(details: string | null) {
  if (!details) return ''
  try {
    return JSON.stringify(typeof details === 'string' ? JSON.parse(details) : details, null, 2)
  } catch {
    return details
  }
}

onMounted(loadLogs)
</script>
