<template>
  <section class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Tesouraria</h2>
      <div class="flex items-center gap-2">
        <select v-model="form.type" class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700">
          <option value="in">Entrada</option>
          <option value="out">Saída</option>
        </select>
        <input v-model.number="form.amount" type="number" min="1" placeholder="Valor"
               class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 w-28" />
        <input v-model="form.note" type="text" placeholder="Observação (opcional)"
               class="px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700 w-64" />
        <button @click="addTx" :disabled="!guild || adding || !form.amount"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          {{ adding ? 'Adicionando...' : 'Adicionar' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="text-sm text-red-400 mb-3">{{ error }}</p>

    <div class="grid sm:grid-cols-3 gap-4 mb-4">
      <div class="p-4 rounded-xl border border-slate-700/40 bg-slate-800/40">
        <div class="opacity-70 text-xs">Entradas</div>
        <div class="text-xl font-bold">{{ toGold(summary.totalIn) }}</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-700/40 bg-slate-800/40">
        <div class="opacity-70 text-xs">Saídas</div>
        <div class="text-xl font-bold">{{ toGold(summary.totalOut) }}</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-700/40 bg-slate-800/40">
        <div class="opacity-70 text-xs">Saldo</div>
        <div class="text-xl font-bold" :class="summary.balance >= 0 ? 'text-emerald-400' : 'text-red-400'">
          {{ toGold(summary.balance) }}
        </div>
      </div>
    </div>

    <div v-if="loading" class="opacity-80">Carregando lançamentos…</div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table class="w-full text-sm">
        <thead class="bg-slate-900/40">
        <tr>
          <th class="text-left p-3">Tipo</th>
          <th class="text-left p-3">Valor</th>
          <th class="text-left p-3">Observação</th>
          <th class="text-left p-3">Data</th>
          <th class="text-right p-3">Ações</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="t in list" :key="t.id" class="border-t border-slate-800/50">
          <td class="p-3">
            <span :class="['px-2 py-0.5 rounded text-xs',
                           t.type==='in' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300']">
              {{ t.type==='in' ? 'Entrada' : 'Saída' }}
            </span>
          </td>
          <td class="p-3 font-medium">{{ toGold(t.amount) }}</td>
          <td class="p-3">{{ t.note || '—' }}</td>
          <td class="p-3">{{ new Date(t.created_at).toLocaleString() }}</td>
          <td class="p-3 text-right">
            <button @click="removeTx(t.id)" class="px-3 py-1 rounded border border-red-600 hover:bg-red-700 text-red-200">Remover</button>
          </td>
        </tr>
        <tr v-if="list.length===0">
          <td class="p-4 text-center opacity-70" colspan="5">Sem lançamentos.</td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GuildsApi, FinanceApi } from '@/lib/api'

const guild   = ref<any>(null)
const list    = ref<any[]>([])
const summary = ref<{ totalIn:number; totalOut:number; balance:number }>({ totalIn:0, totalOut:0, balance:0 })
const loading = ref(true)
const adding  = ref(false)
const error   = ref('')

const form = ref<{ type:'in'|'out'; amount:number|null; note:string }>({
  type: 'in', amount: null, note: ''
})

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const guilds = await GuildsApi.list()
    guild.value = guilds?.[0] ?? null
    if (!guild.value) { list.value = []; summary.value = { totalIn:0,totalOut:0,balance:0 }; return }
    ;[list.value, summary.value] = await Promise.all([
      FinanceApi.listByGuild(guild.value.id),
      FinanceApi.summary(guild.value.id),
    ])
  } catch (e:any) {
    error.value = e.message || 'Falha ao carregar tesouraria'
  } finally {
    loading.value = false
  }
}

async function addTx() {
  if (!guild.value || !form.value.amount) return
  adding.value = true
  error.value = ''
  try {
    await FinanceApi.create({
      guildId: guild.value.id,
      type: form.value.type,
      amount: Math.max(1, Math.floor(form.value.amount)),
      note: form.value.note?.trim() || undefined,
    })
    form.value = { type:'in', amount:null, note:'' }
    await load()
  } catch (e:any) {
    error.value = e.message || 'Falha ao adicionar lançamento'
  } finally {
    adding.value = false
  }
}

async function removeTx(id:number) {
  try {
    await FinanceApi.remove(id)
    await load()
  } catch (e:any) {
    error.value = e.message || 'Falha ao remover'
  }
}

function toGold(n:number) { return new Intl.NumberFormat('pt-BR').format(n) + 'g' }
</script>
