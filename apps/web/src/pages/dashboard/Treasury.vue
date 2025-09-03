<template>
  <section class="flex flex-col gap-4">
    <!-- KPIs -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
        <div class="text-xs uppercase opacity-60">Saldo</div>
        <div class="text-2xl font-bold text-[#C6A95D]">{{ toGold(balance) }}</div>
      </div>
      <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
        <div class="text-xs uppercase opacity-60">Entradas (30d)</div>
        <div class="text-2xl font-bold">{{ toGold(income30) }}</div>
      </div>
      <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
        <div class="text-xs uppercase opacity-60">Saídas (30d)</div>
        <div class="text-2xl font-bold">{{ toGold(out30) }}</div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 overflow-x-auto">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold">Transações</h2>
        <button class="text-sm px-3 py-1 rounded-lg bg-[#C6A95D] text-slate-900">Adicionar</button>
      </div>

      <table class="min-w-full text-sm">
        <thead class="text-left text-xs uppercase opacity-60">
          <tr>
            <th class="py-2">Data</th>
            <th class="py-2">Descrição</th>
            <th class="py-2">Tipo</th>
            <th class="py-2">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in txs" :key="t.id" class="border-t border-slate-800/30">
            <td class="py-2">{{ t.date }}</td>
            <td class="py-2">{{ t.desc }}</td>
            <td class="py-2">
              <span :class="['px-2 py-0.5 rounded-lg text-xs',
                t.type==='in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300']">
                {{ t.type === 'in' ? 'Entrada' : 'Saída' }}
              </span>
            </td>
            <td class="py-2 font-medium" :class="t.type==='in' ? 'text-emerald-400' : 'text-rose-300'">
              {{ (t.type==='in' ? '+' : '-') + toGold(t.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const balance = ref(152340)
const txs = ref([
  { id: 1, date: '2025-08-28', desc: 'Venda de minérios', type: 'in',  amount: 3200 },
  { id: 2, date: '2025-08-29', desc: 'Reparo de equipamentos', type: 'out', amount: 800 },
  { id: 3, date: '2025-08-30', desc: 'Doação do clã aliado', type: 'in',  amount: 5000 },
])

const income30 = computed(() => txs.value.filter(t => t.type==='in').reduce((a,b)=>a+b.amount,0))
const out30    = computed(() => txs.value.filter(t => t.type==='out').reduce((a,b)=>a+b.amount,0))

function toGold(n: number) { return new Intl.NumberFormat('pt-BR').format(n) + 'g' }
</script>
