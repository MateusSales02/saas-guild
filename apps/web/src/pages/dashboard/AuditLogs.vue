<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <header class="mb-2">
      <h1 class="text-3xl font-black bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent">
        Logs de Auditoria
      </h1>
      <p class="text-sm text-slate-400 mt-2">
        Visualize todas as ações realizadas no sistema
      </p>
    </header>

    <!-- FILTROS -->
    <div class="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Filtro por Ação -->
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Ação</label>
          <select
            v-model="filters.action"
            @change="loadLogs"
            class="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-[#C6A95D] focus:ring-1 focus:ring-[#C6A95D] outline-none"
          >
            <option value="">Todas</option>
            <option value="CREATE">Criação</option>
            <option value="UPDATE">Atualização</option>
            <option value="DELETE">Exclusão</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXPORT">Exportação</option>
            <option value="VIEW">Visualização</option>
          </select>
        </div>

        <!-- Filtro por Entidade -->
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Entidade</label>
          <select
            v-model="filters.entityType"
            @change="loadLogs"
            class="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-[#C6A95D] focus:ring-1 focus:ring-[#C6A95D] outline-none"
          >
            <option value="">Todas</option>
            <option value="User">Usuário</option>
            <option value="Guild">Guilda</option>
            <option value="Event">Evento</option>
            <option value="Finance">Finanças</option>
            <option value="Build">Build</option>
          </select>
        </div>

        <!-- Data Início -->
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Data Início</label>
          <input
            type="date"
            v-model="filters.startDate"
            @change="loadLogs"
            class="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-[#C6A95D] focus:ring-1 focus:ring-[#C6A95D] outline-none"
          />
        </div>

        <!-- Data Fim -->
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-2">Data Fim</label>
          <input
            type="date"
            v-model="filters.endDate"
            @change="loadLogs"
            class="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-[#C6A95D] focus:ring-1 focus:ring-[#C6A95D] outline-none"
          />
        </div>

        <!-- Botão Limpar Filtros -->
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-[#C6A95D] hover:text-[#C6A95D] transition-all"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- ERRO -->
    <div
      v-if="error"
      class="rounded-lg border border-rose-500/70 bg-rose-950/70 px-4 py-3 text-sm text-rose-100"
    >
      ⚠️ {{ error }}
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="bg-slate-900/40 border border-slate-800 rounded-xl p-6 animate-pulse">
      <div class="h-4 bg-slate-800 rounded w-1/4 mb-4"></div>
      <div class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-12 bg-slate-800 rounded"></div>
      </div>
    </div>

    <!-- TABELA DE LOGS -->
    <div v-else class="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data/Hora</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuário</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ação</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Entidade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">IP</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Detalhes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="text-slate-300">{{ log.user_email || 'Sistema' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getActionBadgeClass(log.action)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getActionLabel(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {{ log.entity_type }}
                <span v-if="log.entity_id" class="text-slate-500">#{{ log.entity_id }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                {{ log.ip_address || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                {{ log.details || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINAÇÃO -->
      <div class="bg-slate-800/30 px-6 py-4 flex items-center justify-between border-t border-slate-700">
        <div class="text-sm text-slate-400">
          Mostrando {{ logs.length }} registros
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="filters.offset === 0"
            class="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-[#C6A95D] hover:text-[#C6A95D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="nextPage"
            :disabled="logs.length < filters.limit"
            class="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-[#C6A95D] hover:text-[#C6A95D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

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

interface Filters {
  action: string
  entityType: string
  startDate: string
  endDate: string
  limit: number
  offset: number
}

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const error = ref('')

const filters = ref<Filters>({
  action: '',
  entityType: '',
  startDate: '',
  endDate: '',
  limit: 50,
  offset: 0
})

const loadLogs = async () => {
  loading.value = true
  error.value = ''

  try {
    const params: any = {
      limit: filters.value.limit,
      offset: filters.value.offset
    }

    if (filters.value.action) params.action = filters.value.action
    if (filters.value.entityType) params.entityType = filters.value.entityType
    if (filters.value.startDate) params.startDate = filters.value.startDate
    if (filters.value.endDate) params.endDate = filters.value.endDate

    const response = await axios.get('/audit', { params })
    logs.value = response.data.logs || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar logs de auditoria'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  }
  loadLogs()
}

const previousPage = () => {
  if (filters.value.offset >= filters.value.limit) {
    filters.value.offset -= filters.value.limit
    loadLogs()
  }
}

const nextPage = () => {
  filters.value.offset += filters.value.limit
  loadLogs()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    CREATE: 'Criação',
    UPDATE: 'Atualização',
    DELETE: 'Exclusão',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    EXPORT: 'Exportação',
    VIEW: 'Visualização'
  }
  return labels[action] || action
}

const getActionBadgeClass = (action: string) => {
  const classes: Record<string, string> = {
    CREATE: 'bg-green-500/20 text-green-400 border border-green-500/30',
    UPDATE: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border border-red-500/30',
    LOGIN: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    LOGOUT: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    EXPORT: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    VIEW: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
  }
  return classes[action] || 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
}

onMounted(() => {
  loadLogs()
})
</script>
