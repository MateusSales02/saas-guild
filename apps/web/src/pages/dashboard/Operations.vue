<template>
  <div class="page">
    <PageHeader :eyebrow="guild?.name ?? 'Guilda'" title="Compras e lucros" subtitle="Registre o que foi comprado, quanto foi gasto, o lucro esperado e o que realmente voltou.">
      <template #actions>
        <button type="button" class="btn btn-secondary" :disabled="list.length === 0" @click="exportCsv">
          <AppIcon name="download" :size="16" />
          Exportar CSV
        </button>
        <button type="button" class="btn btn-primary" :disabled="!guild" @click="openCreate">
          <AppIcon name="plus" :size="16" />
          Nova compra
        </button>
      </template>
    </PageHeader>

    <div v-if="error" role="alert" class="alert alert-error">
      <AppIcon name="alert" :size="18" class="mt-0.5" />
      <p class="flex-1">{{ error }}</p>
      <button type="button" class="btn btn-danger btn-sm" @click="load">Tentar novamente</button>
    </div>

    <!-- Indicadores -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="stat">
        <p class="stat-label"><AppIcon name="wallet" :size="15" class="text-gold-400" /> Total investido</p>
        <p class="stat-value"><span v-if="loading" class="skeleton inline-block h-7 w-32" /><template v-else>{{ toSilver(summary.invested) }}</template></p>
        <p class="stat-meta">{{ toSilver(summary.openCapital) }} em {{ summary.counts.open }} abertas · {{ toSilver(summary.openReceived) }} já voltou</p>
      </div>
      <div class="stat">
        <p class="stat-label"><AppIcon name="target" :size="15" class="text-sky-400" /> Lucro esperado</p>
        <p class="stat-value" :class="tone(summary.expectedProfit)"><span v-if="loading" class="skeleton inline-block h-7 w-32" /><template v-else>{{ signedSilver(summary.expectedProfit) }}</template></p>
        <p class="stat-meta">{{ signedSilver(summary.openExpectedProfit) }} ainda a realizar</p>
      </div>
      <div class="stat">
        <p class="stat-label"><AppIcon name="coins" :size="15" class="text-emerald-400" /> Lucro realizado</p>
        <p class="stat-value" :class="tone(summary.realizedProfit)"><span v-if="loading" class="skeleton inline-block h-7 w-32" /><template v-else>{{ signedSilver(summary.realizedProfit) }}</template></p>
        <p class="stat-meta">de {{ signedSilver(summary.closedExpectedProfit) }} esperados nas encerradas</p>
      </div>
      <div class="stat">
        <p class="stat-label"><AppIcon name="trend-up" :size="15" class="text-gold-400" /> Desempenho</p>
        <p class="stat-value">{{ percent(summary.accuracy) }} <span class="text-sm font-normal text-slate-500">da meta</span></p>
        <p class="stat-meta">ROI {{ percent(summary.roi, 1) }} · {{ percent(summary.winRate) }} com lucro</p>
      </div>
    </div>

    <!-- Esperado x realizado -->
    <div class="grid gap-4 xl:grid-cols-5">
      <section class="panel xl:col-span-3">
        <header class="panel-header">
          <div>
            <h2 class="panel-title">Esperado × realizado</h2>
            <p class="panel-subtitle">Lucro das operações encerradas, por mês da venda</p>
          </div>
          <div class="flex items-center gap-4 text-xs text-slate-400" aria-hidden="true">
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm" :style="{ background: COLOR_EXPECTED }" /> Esperado</span>
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm" :style="{ background: COLOR_REALIZED }" /> Realizado</span>
          </div>
        </header>
        <div class="p-4">
          <div v-if="loading" class="skeleton h-[220px]" />
          <p v-else-if="!hasMonthly" class="py-20 text-center text-sm text-slate-500">O gráfico aparece quando houver vendas registradas.</p>
          <div v-else ref="chartRef" class="relative" @pointerleave="hoverMonth = null">
            <svg :viewBox="`0 0 ${CHART.w} ${CHART.h}`" class="block h-[220px] w-full" preserveAspectRatio="none" role="img" :aria-label="chartAria">
              <g v-for="t in chartTicks" :key="t">
                <line :x1="CHART.left" :x2="CHART.w - 8" :y1="cy(t)" :y2="cy(t)" :stroke="t === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'" vector-effect="non-scaling-stroke" />
              </g>
              <g v-for="(m, i) in summary.monthly" :key="m.month">
                <rect :x="groupX(i)" :y="CHART.top" :width="groupW" :height="CHART.h - CHART.top - CHART.bottom" fill="transparent" @pointerenter="hoverMonth = i" @pointerdown="hoverMonth = i" />
                <rect :x="groupX(i) + groupW / 2 - barW - 1" :y="barY(m.expectedProfit)" :width="barW" :height="barH(m.expectedProfit)" rx="3" :fill="COLOR_EXPECTED" :opacity="hoverMonth === null || hoverMonth === i ? 1 : 0.45" pointer-events="none" />
                <rect :x="groupX(i) + groupW / 2 + 1" :y="barY(m.realizedProfit)" :width="barW" :height="barH(m.realizedProfit)" rx="3" :fill="COLOR_REALIZED" :opacity="hoverMonth === null || hoverMonth === i ? 1 : 0.45" pointer-events="none" />
              </g>
            </svg>
            <!-- rótulos em HTML para não distorcer com o viewBox elástico -->
            <div class="pointer-events-none absolute inset-y-0 left-0 w-12 text-right text-[10.5px] text-slate-500">
              <span v-for="t in chartTicks" :key="t" class="absolute right-2 -translate-y-1/2" :style="{ top: `${(cy(t) / CHART.h) * 100}%` }">{{ compactSilver(t) }}</span>
            </div>
            <div class="mt-1 flex text-[11px] capitalize text-slate-500" :style="{ paddingLeft: `${(CHART.left / CHART.w) * 100}%`, paddingRight: `${(8 / CHART.w) * 100}%` }">
              <span v-for="m in summary.monthly" :key="m.month" class="flex-1 text-center">{{ monthLabel(m.month) }}</span>
            </div>
            <div
              v-if="hoverMonth !== null && summary.monthly[hoverMonth]"
              class="pointer-events-none absolute top-2 z-10 w-48 rounded-lg border border-white/10 bg-ink-800/95 px-3 py-2 text-xs shadow-pop"
              :style="tooltipStyle"
            >
              <p class="mb-1 font-semibold capitalize text-slate-100">{{ monthLabel(summary.monthly[hoverMonth].month) }} · {{ summary.monthly[hoverMonth].count }} vendas</p>
              <p class="flex justify-between gap-2 text-slate-400"><span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-sm" :style="{ background: COLOR_EXPECTED }" />Esperado</span><span class="tabular-nums text-slate-200">{{ signedSilver(summary.monthly[hoverMonth].expectedProfit) }}</span></p>
              <p class="flex justify-between gap-2 text-slate-400"><span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-sm" :style="{ background: COLOR_REALIZED }" />Realizado</span><span class="tabular-nums text-slate-200">{{ signedSilver(summary.monthly[hoverMonth].realizedProfit) }}</span></p>
            </div>
          </div>
        </div>
      </section>

      <section class="panel overflow-hidden xl:col-span-2">
        <header class="panel-header">
          <div>
            <h2 class="panel-title">Por tipo de operação</h2>
            <p class="panel-subtitle">Onde o lucro está vindo de verdade</p>
          </div>
        </header>
        <div v-if="loading" class="space-y-2 p-5"><div v-for="i in 4" :key="i" class="skeleton h-8" /></div>
        <p v-else-if="summary.byCategory.length === 0" class="px-5 py-16 text-center text-sm text-slate-500">Sem dados ainda.</p>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col" class="!text-right">Investido</th>
                <th scope="col" class="!text-right">Esperado</th>
                <th scope="col" class="!text-right">Realizado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in summary.byCategory" :key="c.category">
                <td><span class="text-slate-100">{{ CATEGORY_LABELS[c.category] }}</span> <span class="text-xs text-slate-500">· {{ c.count }}</span></td>
                <td class="text-right tabular-nums">{{ compactSilver(c.invested) }}</td>
                <td class="text-right tabular-nums">{{ compactSilver(c.expectedProfit) }}</td>
                <td class="text-right font-semibold tabular-nums" :class="tone(c.realizedProfit)">{{ compactSilver(c.realizedProfit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Lista -->
    <section class="panel overflow-hidden">
      <header class="panel-header">
        <div>
          <h2 class="panel-title">Operações</h2>
          <p class="panel-subtitle">{{ filtered.length }} de {{ list.length }} registros</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label class="relative block w-full sm:w-56">
            <span class="sr-only">Buscar operação</span>
            <AppIcon name="search" :size="15" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input v-model="search" type="search" placeholder="Buscar item ou nota" class="input input-sm !pl-8" />
          </label>
          <select v-model="categoryFilter" class="select input-sm w-auto" aria-label="Filtrar por tipo">
            <option value="all">Todos os tipos</option>
            <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
          <div class="seg" role="group" aria-label="Filtrar por situação">
            <button v-for="f in STATUS_FILTERS" :key="f.value" type="button" class="seg-item" :aria-pressed="statusFilter === f.value" @click="statusFilter = f.value">
              {{ f.label }}
            </button>
          </div>
        </div>
      </header>

      <div v-if="loading" class="space-y-2 p-5"><div v-for="i in 5" :key="i" class="skeleton h-12" /></div>
      <EmptyState v-else-if="list.length === 0" icon="wallet" title="Nenhuma compra registrada" text="Registre uma compra para acompanhar o lucro esperado e o resultado da venda.">
        <button type="button" class="btn btn-primary btn-sm" :disabled="!guild" @click="openCreate"><AppIcon name="plus" :size="15" /> Nova compra</button>
      </EmptyState>
      <EmptyState v-else-if="filtered.length === 0" icon="search" title="Nenhuma operação encontrada" />

      <div v-else class="overflow-x-auto">
        <table class="table min-w-[920px]">
          <thead>
            <tr>
              <th scope="col">Compra</th>
              <th scope="col">Operação</th>
              <th scope="col" class="!text-right">Gasto</th>
              <th scope="col" class="!text-right">Lucro esperado</th>
              <th scope="col" class="!text-right">Recebido / lucro real</th>
              <th scope="col" class="!text-right">Diferença</th>
              <th scope="col">Situação</th>
              <th scope="col"><span class="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in paged" :key="o.id" class="group">
              <td class="whitespace-nowrap text-xs text-slate-500">
                <span class="block text-slate-300">{{ shortDate(o.purchased_at) }}</span>
                <template v-if="o.sold_at">fim {{ shortDate(o.sold_at) }}</template>
              </td>
              <td>
                <button type="button" class="max-w-[260px] truncate text-left text-slate-100 hover:text-gold-200" :title="o.title" @click="openLedger(o)">{{ o.title }}</button>
                <p class="text-xs text-slate-500">
                  {{ CATEGORY_LABELS[o.category] }} · {{ o.entries?.length ?? 0 }} movimentos
                  <template v-if="o.created_by_name"> · por {{ o.created_by_name }}</template>
                  <span v-if="o.entries?.some((e) => e.tx_id)" class="ml-1 text-gold-400/80" title="Tem movimentos lançados na tesouraria">● tesouraria</span>
                </p>
                <div v-if="o.quantity > 1" class="mt-1.5 flex items-center gap-2" :title="`${o.sold_quantity} de ${o.quantity} unidades vendidas`">
                  <div class="h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                    <div class="h-full rounded-full bg-gold-500/70" :style="{ width: `${soldProgress(o) * 100}%` }" />
                  </div>
                  <span class="text-[11px] tabular-nums text-slate-500">{{ o.sold_quantity }}/{{ o.quantity }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap text-right tabular-nums">
                {{ toSilver(o.total_cost) }}
                <span v-if="o.fees" class="block text-xs text-slate-500">gastos {{ compactSilver(o.fees) }}</span>
              </td>
              <td class="whitespace-nowrap text-right tabular-nums" :class="tone(o.expected_profit)">
                {{ signedSilver(o.expected_profit) }}
                <span class="block text-xs text-slate-500">{{ percent(margin(o.expected_profit, o.total_cost)) }}</span>
              </td>
              <td class="whitespace-nowrap text-right font-semibold tabular-nums" :class="o.actual_profit === null ? 'text-slate-300' : tone(o.actual_profit)">
                <template v-if="o.actual_profit === null">
                  <span v-if="o.received">{{ toSilver(o.received) }}</span>
                  <span v-else class="text-slate-600">—</span>
                  <span v-if="o.received" class="block text-xs font-normal" :class="tone(o.balance)">saldo {{ signedSilver(o.balance) }}</span>
                </template>
                <template v-else>
                  {{ signedSilver(o.actual_profit) }}
                  <span class="block text-xs font-normal text-slate-500">{{ percent(margin(o.actual_profit, o.total_cost)) }}</span>
                </template>
              </td>
              <td class="whitespace-nowrap text-right tabular-nums" :class="o.variance === null ? 'text-slate-600' : tone(o.variance)">
                {{ o.variance === null ? '—' : signedSilver(o.variance) }}
              </td>
              <td><span class="badge" :class="STATUS_BADGE[o.status]">{{ STATUS_LABELS[o.status] }}</span></td>
              <td class="whitespace-nowrap text-right">
                <button type="button" class="btn btn-secondary btn-sm" @click="openLedger(o)">
                  <AppIcon name="list" :size="14" /> Movimentos
                </button>
                <button type="button" class="btn btn-ghost btn-icon btn-sm" :aria-label="`Editar ${o.title}`" title="Editar" @click="openEdit(o)">
                  <AppIcon name="edit" :size="15" />
                </button>
                <button v-if="o.status !== 'open'" type="button" class="btn btn-ghost btn-icon btn-sm" :aria-label="`Reabrir ${o.title}`" title="Reabrir" @click="reopen(o)">
                  <AppIcon name="refresh" :size="15" />
                </button>
                <button type="button" class="btn btn-ghost btn-icon btn-sm hover:!text-rose-300" :aria-label="`Excluir ${o.title}`" title="Excluir" @click="remove(o)">
                  <AppIcon name="trash" :size="15" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="filtered.length > paged.length" class="panel-footer justify-center">
        <button type="button" class="btn btn-ghost btn-sm" @click="pageSize += 25">Mostrar mais {{ Math.min(25, filtered.length - paged.length) }}</button>
      </footer>
    </section>

    <!-- NOVA / EDITAR COMPRA -->
    <Teleport to="body">
      <div v-if="formOpen" class="modal-backdrop" @mousedown.self="formOpen = false" @keydown.esc="formOpen = false">
        <form class="modal-panel max-w-xl" role="dialog" aria-modal="true" aria-labelledby="op-form-title" @submit.prevent="submitForm">
          <header class="panel-header">
            <div>
              <h2 id="op-form-title" class="section-title">{{ editing ? 'Editar operação' : 'Nova compra' }}</h2>
              <p class="panel-subtitle">{{ editing ? 'Valores de compra, taxas e vendas mudam em Movimentos' : 'Compra inicial. Vendas parciais e gastos extras entram depois, em Movimentos' }}</p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="formOpen = false"><AppIcon name="x" /></button>
          </header>
          <div class="grid gap-4 p-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="op-title" class="label">O que foi comprado</label>
              <input id="op-title" v-model="form.title" type="text" maxlength="120" required placeholder="Ex: 50× Bolsa T6.1, couro T5 para refino..." class="input" />
            </div>
            <div>
              <label for="op-category" class="label">Tipo</label>
              <select id="op-category" v-model="form.category" class="select">
                <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>
            <div>
              <label for="op-qty" class="label">Quantidade</label>
              <input id="op-qty" v-model.number="form.quantity" type="number" min="1" step="1" class="input tabular-nums" />
            </div>
            <div v-if="!editing">
              <label for="op-cost" class="label flex justify-between">Gasto na compra <span v-if="form.cost && form.quantity > 1" class="text-slate-500">{{ toSilver(form.cost / form.quantity) }}/un.</span></label>
              <input id="op-cost" v-model.number="form.cost" type="number" min="0" step="1000" required inputmode="numeric" placeholder="0" class="input tabular-nums" />
            </div>
            <div>
              <label for="op-fee-rate" class="label flex justify-between">Taxa do mercado (%) <span class="text-slate-500">premium 4% + setup 2,5%</span></label>
              <input id="op-fee-rate" v-model.number="form.feeRate" type="number" min="0" max="100" step="0.5" inputmode="decimal" placeholder="6,5" class="input tabular-nums" />
            </div>
            <div>
              <label for="op-expected" class="label flex justify-between">Venda esperada (tudo) <span v-if="form.expectedRevenue && form.quantity > 1" class="text-slate-500">{{ toSilver(form.expectedRevenue / form.quantity) }}/un.</span></label>
              <input id="op-expected" v-model.number="form.expectedRevenue" type="number" min="0" step="1000" required inputmode="numeric" placeholder="0" class="input tabular-nums" />
            </div>
            <div>
              <label for="op-date" class="label">Data da compra</label>
              <input id="op-date" v-model="form.purchasedAt" type="date" class="input" />
            </div>
            <div class="sm:col-span-2">
              <label for="op-note" class="label">Observação</label>
              <input id="op-note" v-model="form.note" type="text" maxlength="500" placeholder="Cidade, estratégia, fornecedor..." class="input" />
            </div>
            <label v-if="!editing" class="check sm:col-span-2">
              <input v-model="form.syncTreasury" type="checkbox" class="h-4 w-4 accent-gold-500" />
              Lançar o gasto como saída na tesouraria da guilda
            </label>

            <div class="inset grid grid-cols-2 gap-2 px-4 py-3 text-xs sm:col-span-2 sm:grid-cols-4">
              <div><p class="text-slate-500">Custo total</p><p class="mt-0.5 font-semibold tabular-nums text-slate-100">{{ toSilver(formPreview.totalCost) }}</p></div>
              <div><p class="text-slate-500">Taxa na venda</p><p class="mt-0.5 font-semibold tabular-nums text-slate-100">{{ formPreview.tax ? '−' + toSilver(formPreview.tax) : '0g' }}</p></div>
              <div><p class="text-slate-500">Lucro esperado</p><p class="mt-0.5 font-semibold tabular-nums" :class="tone(formPreview.profit)">{{ signedSilver(formPreview.profit) }}</p></div>
              <div><p class="text-slate-500">Margem</p><p class="mt-0.5 font-semibold tabular-nums" :class="tone(formPreview.profit)">{{ percent(formPreview.margin, 1) }}</p></div>
            </div>
          </div>
          <footer class="flex justify-end gap-2 border-t border-white/[0.06] p-4">
            <button type="button" class="btn btn-ghost" @click="formOpen = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving || !form.title.trim() || (!editing && form.cost === null) || form.expectedRevenue === null">
              <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
              <AppIcon v-else name="check" :size="16" />
              {{ editing ? 'Salvar' : 'Registrar compra' }}
            </button>
          </footer>
        </form>
      </div>
    </Teleport>

    <!-- MOVIMENTOS: entradas e saídas da operação -->
    <Teleport to="body">
      <div v-if="ledger" class="modal-backdrop" @mousedown.self="ledger = null" @keydown.esc="ledger = null">
        <div class="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="ledger-title">
          <header class="panel-header">
            <div class="min-w-0">
              <h2 id="ledger-title" class="section-title truncate">{{ ledger.title }}</h2>
              <p class="panel-subtitle">
                {{ CATEGORY_LABELS[ledger.category] }} ·
                <span class="badge" :class="STATUS_BADGE[ledger.status]">{{ STATUS_LABELS[ledger.status] }}</span>
              </p>
            </div>
            <button type="button" class="btn btn-ghost btn-icon btn-sm" aria-label="Fechar" @click="ledger = null"><AppIcon name="x" /></button>
          </header>

          <!-- Resumo da operação -->
          <div class="grid grid-cols-2 gap-px border-b border-white/[0.06] bg-white/[0.04] sm:grid-cols-4">
            <div class="bg-ink-900 px-5 py-3">
              <p class="text-xs text-slate-500">Saídas</p>
              <p class="mt-0.5 font-semibold tabular-nums text-rose-200">{{ toSilver(ledger.total_cost) }}</p>
              <p class="text-[11px] text-slate-500">compra {{ compactSilver(ledger.cost) }} · gastos {{ compactSilver(ledger.fees) }}</p>
            </div>
            <div class="bg-ink-900 px-5 py-3">
              <p class="text-xs text-slate-500">Entradas</p>
              <p class="mt-0.5 font-semibold tabular-nums text-emerald-200">{{ toSilver(ledger.received) }}</p>
              <p class="text-[11px] text-slate-500">{{ ledger.sold_quantity }} de {{ ledger.quantity }} un. vendidas<template v-if="ledger.market_tax"> · taxa {{ compactSilver(ledger.market_tax) }}</template></p>
            </div>
            <div class="bg-ink-900 px-5 py-3">
              <p class="text-xs text-slate-500">{{ ledger.status === 'open' ? 'Saldo até agora' : 'Lucro real' }}</p>
              <p class="mt-0.5 font-semibold tabular-nums" :class="tone(ledger.balance)">{{ signedSilver(ledger.balance) }}</p>
              <p class="text-[11px] text-slate-500">
                <template v-if="ledger.balance < 0">faltam {{ toSilver(-ledger.balance) }} p/ empatar</template>
                <template v-else>custo já coberto</template>
              </p>
            </div>
            <div class="bg-ink-900 px-5 py-3">
              <p class="text-xs text-slate-500">Lucro esperado</p>
              <p class="mt-0.5 font-semibold tabular-nums" :class="tone(ledger.expected_profit)">{{ signedSilver(ledger.expected_profit) }}</p>
              <p class="text-[11px] text-slate-500">venda esperada {{ compactSilver(ledger.expected_revenue) }} − {{ percent(ledger.fee_rate / 100, 1) }}</p>
            </div>
          </div>
          <div v-if="ledger.quantity > 1" class="px-5 pt-4">
            <div class="h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" :aria-valuenow="ledger.sold_quantity" :aria-valuemax="ledger.quantity" aria-label="Unidades vendidas">
              <div class="h-full rounded-full bg-gold-500/70" :style="{ width: `${soldProgress(ledger) * 100}%` }" />
            </div>
          </div>

          <!-- Novo movimento -->
          <form v-if="ledger.status === 'open'" class="space-y-3 border-b border-white/[0.06] p-5" @submit.prevent="submitEntry">
            <div class="seg flex-wrap" role="radiogroup" aria-label="Tipo de movimento">
              <button v-for="k in ENTRY_KIND_OPTIONS" :key="k.value" type="button" role="radio" class="seg-item" :aria-checked="entryForm.kind === k.value" :aria-pressed="entryForm.kind === k.value" @click="entryForm.kind = k.value">
                <span :class="k.value === 'sale' ? 'text-emerald-300' : 'text-rose-300'">{{ k.value === 'sale' ? '+' : '−' }}</span> {{ k.label }}
              </button>
            </div>
            <div class="grid items-start gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
              <div>
                <label for="entry-amount" class="label flex justify-between">
                  {{ entryForm.kind === 'sale' ? 'Valor da venda' : 'Valor' }}
                  <span v-if="entryForm.amount && entryForm.quantity" class="text-slate-500">{{ toSilver(entryForm.amount / entryForm.quantity) }}/un.</span>
                </label>
                <input id="entry-amount" v-model.number="entryForm.amount" type="number" min="1" step="1000" inputmode="numeric" placeholder="0" class="input tabular-nums" />
                <p v-if="entryForm.kind === 'sale' && entryForm.amount && ledger.fee_rate" class="mt-1 text-[11px] text-slate-500">
                  taxa {{ percent(ledger.fee_rate / 100, 1) }} −{{ toSilver(entryTax) }} · entra <span class="text-emerald-300">{{ toSilver(entryForm.amount - entryTax) }}</span>
                </p>
              </div>
              <div>
                <label for="entry-qty" class="label flex justify-between">
                  Quantidade
                  <button v-if="entryForm.kind === 'sale' && remainingQty > 0" type="button" class="text-gold-300 hover:underline" @click="entryForm.quantity = remainingQty">resto ({{ remainingQty }})</button>
                </label>
                <input id="entry-qty" v-model.number="entryForm.quantity" type="number" min="1" step="1" placeholder="opcional" class="input tabular-nums" />
              </div>
              <div>
                <label for="entry-date" class="label">Data</label>
                <input id="entry-date" v-model="entryForm.occurredAt" type="date" class="input" />
              </div>
            </div>
            <div class="flex flex-wrap items-end gap-3">
              <div class="min-w-[200px] flex-1">
                <label for="entry-note" class="label">Observação</label>
                <input id="entry-note" v-model="entryForm.note" type="text" maxlength="255" :placeholder="entryForm.kind === 'sale' ? 'Ex: lote 2, vendido em Martlock' : 'Ex: taxa da estação, comida de foco, transporte'" class="input" />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="saving || !entryForm.amount">
                <span v-if="saving" class="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
                <AppIcon v-else name="plus" :size="16" />
                Lançar
              </button>
            </div>
            <label class="check">
              <input v-model="entryForm.syncTreasury" type="checkbox" class="h-4 w-4 accent-gold-500" />
              Lançar também na tesouraria como {{ entryForm.kind === 'sale' ? 'entrada' : 'saída' }}
            </label>
          </form>
          <div v-else class="alert alert-info m-5">
            <AppIcon name="info" :size="16" class="mt-0.5" />
            <p class="flex-1">Operação encerrada. Reabra para lançar novos movimentos.</p>
          </div>

          <!-- Histórico -->
          <div class="max-h-[40vh] overflow-y-auto">
            <p v-if="!ledger.entries?.length" class="px-5 py-10 text-center text-sm text-slate-500">Nenhum movimento ainda.</p>
            <table v-else class="table">
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Movimento</th>
                  <th scope="col" class="!text-right">Qtd</th>
                  <th scope="col" class="!text-right">Valor</th>
                  <th scope="col"><span class="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in ledger.entries" :key="e.id" class="group">
                  <td class="whitespace-nowrap text-xs text-slate-400">{{ shortDate(e.occurred_at) }}</td>
                  <td>
                    <p class="text-slate-100">{{ ENTRY_LABELS[e.kind] }}<span v-if="e.note" class="text-slate-400"> · {{ e.note }}</span></p>
                    <p class="text-xs text-slate-500">
                      <template v-if="e.created_by_name">por {{ e.created_by_name }}</template>
                      <span v-if="e.tax" class="ml-1">bruto {{ toSilver(e.amount) }} · taxa −{{ toSilver(e.tax) }}</span>
                      <span v-if="e.tx_id" class="ml-1 text-gold-400/80">● tesouraria</span>
                    </p>
                  </td>
                  <td class="text-right tabular-nums text-slate-400">{{ e.quantity ?? '—' }}</td>
                  <td class="whitespace-nowrap text-right font-semibold tabular-nums" :class="e.kind === 'sale' ? 'text-emerald-300' : 'text-rose-300'">
                    {{ e.kind === 'sale' ? '+' : '−' }}{{ toSilver(e.amount - (e.tax ?? 0)) }}
                  </td>
                  <td class="w-10 text-right">
                    <button
                      v-if="ledger.status === 'open'"
                      type="button"
                      class="btn btn-ghost btn-icon btn-sm opacity-0 hover:!text-rose-300 focus:opacity-100 group-hover:opacity-100"
                      :aria-label="`Excluir movimento ${ENTRY_LABELS[e.kind]}`"
                      @click="removeEntry(e)"
                    >
                      <AppIcon name="trash" :size="14" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] p-4">
            <template v-if="ledger.status === 'open'">
              <p class="mr-auto text-xs text-slate-500">Terminou de vender? Encerre para contar no lucro realizado.</p>
              <button type="button" class="btn btn-ghost hover:!text-rose-300" :disabled="saving" @click="closeOp('cancelled')">Encerrar como perda</button>
              <button type="button" class="btn btn-primary" :disabled="saving" @click="closeOp('sold')">
                <AppIcon name="check" :size="16" /> Encerrar operação
              </button>
            </template>
            <button v-else type="button" class="btn btn-secondary" @click="reopen(ledger)">
              <AppIcon name="refresh" :size="15" /> Reabrir
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import {
  OperationsApi,
  type EntryKind,
  type FinanceOperation,
  type OperationCategory,
  type OperationEntry,
  type OperationStatus,
  type OperationsSummary,
} from '@/lib/api'
import { friendlyError } from '@/lib/errors'
import { normalizeText } from '@/lib/market'
import {
  CATEGORY_LABELS,
  ENTRY_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  compactSilver,
  dayToIso,
  isoDay,
  monthLabel,
  percent,
  previewProfit,
  DEFAULT_FEE_RATE,
  marketTax,
  signedSilver,
  soldProgress,
  toSilver,
} from '@/lib/operations'
import { confirmAction, toast } from '@/lib/toast'
import { auth } from '@/stores/auth'

// Validadas no fundo ink-850 (dataviz validate_palette, modo escuro)
const COLOR_EXPECTED = '#5b8def'
const COLOR_REALIZED = '#b0841c'

const STATUS_FILTERS: Array<{ value: 'all' | OperationStatus; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'open', label: 'Em aberto' },
  { value: 'sold', label: 'Vendidas' },
  { value: 'cancelled', label: 'Perdidas' },
]

const EMPTY_SUMMARY: OperationsSummary = {
  counts: { total: 0, open: 0, sold: 0, cancelled: 0 },
  invested: 0,
  openCapital: 0,
  openReceived: 0,
  openExpectedProfit: 0,
  expectedProfit: 0,
  closedExpectedProfit: 0,
  realizedRevenue: 0,
  realizedProfit: 0,
  accuracy: null,
  roi: null,
  winRate: null,
  byCategory: [],
  monthly: [],
}

const guild = computed(() => auth.guild)
const list = ref<FinanceOperation[]>([])
const summary = ref<OperationsSummary>(EMPTY_SUMMARY)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref<'all' | OperationStatus>('all')
const categoryFilter = ref<'all' | OperationCategory>('all')
const pageSize = ref(25)

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (!guild.value) {
      list.value = []
      summary.value = EMPTY_SUMMARY
      return
    }
    const [items, s] = await Promise.all([OperationsApi.listByGuild(guild.value.id), OperationsApi.summary(guild.value.id)])
    list.value = items ?? []
    summary.value = s ?? EMPTY_SUMMARY
  } catch (e) {
    error.value = friendlyError(e, 'Não foi possível carregar as operações.')
  } finally {
    loading.value = false
  }
}

async function refreshSummary() {
  if (!guild.value) return
  try {
    summary.value = await OperationsApi.summary(guild.value.id)
  } catch {
    // os indicadores voltam no próximo carregamento
  }
}

function upsert(op: FinanceOperation) {
  const i = list.value.findIndex((o) => o.id === op.id)
  if (i >= 0) list.value.splice(i, 1, op)
  else list.value.unshift(op)
  void refreshSummary()
}

// ---------- Lista ----------
const filtered = computed(() => {
  const needle = normalizeText(search.value)
  return list.value
    .filter((o) => statusFilter.value === 'all' || o.status === statusFilter.value)
    .filter((o) => categoryFilter.value === 'all' || o.category === categoryFilter.value)
    .filter((o) => !needle || normalizeText(`${o.title} ${o.note ?? ''}`).includes(needle))
})
const paged = computed(() => filtered.value.slice(0, pageSize.value))
watch([search, statusFilter, categoryFilter], () => (pageSize.value = 25))

function tone(n: number) {
  return n > 0 ? 'text-emerald-300' : n < 0 ? 'text-rose-300' : 'text-slate-300'
}

function margin(profit: number, cost: number) {
  return cost > 0 ? profit / cost : null
}

function shortDate(iso: string) {
  const d = new Date(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: sameYear ? undefined : 'numeric' })
}

// ---------- Gráfico ----------
const CHART = { w: 600, h: 220, top: 10, bottom: 10, left: 48 }
const chartRef = ref<HTMLElement | null>(null)
const hoverMonth = ref<number | null>(null)

const hasMonthly = computed(() => summary.value.monthly.some((m) => m.count > 0))

const chartRange = computed(() => {
  const values = summary.value.monthly.flatMap((m) => [m.expectedProfit, m.realizedProfit])
  const max = Math.max(0, ...values)
  const min = Math.min(0, ...values)
  const step = niceStep((max - min || 1) / 4)
  return { min: Math.floor(min / step) * step, max: Math.ceil(max / step) * step || step, step }
})

const chartTicks = computed(() => {
  const { min, max, step } = chartRange.value
  const ticks: number[] = []
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Math.round(t))
  return ticks
})

function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

function cy(v: number) {
  const { min, max } = chartRange.value
  const plotH = CHART.h - CHART.top - CHART.bottom
  return CHART.top + ((max - v) / (max - min || 1)) * plotH
}

const groupW = computed(() => (CHART.w - CHART.left - 8) / Math.max(1, summary.value.monthly.length))
const barW = computed(() => Math.min(28, groupW.value * 0.3))
const groupX = (i: number) => CHART.left + i * groupW.value
const barY = (v: number) => Math.min(cy(v), cy(0))
const barH = (v: number) => Math.max(v === 0 ? 0 : 2, Math.abs(cy(v) - cy(0)))

const tooltipStyle = computed(() => {
  if (hoverMonth.value === null) return {}
  const center = ((groupX(hoverMonth.value) + groupW.value / 2) / CHART.w) * 100
  return center > 60 ? { right: `${100 - center + 4}%` } : { left: `${center + 4}%` }
})

const chartAria = computed(() =>
  'Lucro esperado e realizado por mês: ' +
  summary.value.monthly.map((m) => `${monthLabel(m.month)}, esperado ${toSilver(m.expectedProfit)}, realizado ${toSilver(m.realizedProfit)}`).join('; '),
)

// ---------- Formulário de compra ----------
type FormState = {
  title: string
  category: OperationCategory
  quantity: number
  cost: number | null
  feeRate: number | null
  expectedRevenue: number | null
  purchasedAt: string
  note: string
  syncTreasury: boolean
}

const formOpen = ref(false)
const editing = ref<FinanceOperation | null>(null)
const form = ref<FormState>(blankForm())

function blankForm(): FormState {
  return {
    title: '',
    category: 'flip',
    quantity: 1,
    cost: null,
    feeRate: DEFAULT_FEE_RATE,
    expectedRevenue: null,
    purchasedAt: isoDay(new Date()),
    note: '',
    syncTreasury: false,
  }
}

const formPreview = computed(() => previewProfit({ cost: form.value.cost, feeRate: form.value.feeRate, revenue: form.value.expectedRevenue }))

function openCreate() {
  editing.value = null
  form.value = blankForm()
  formOpen.value = true
}

function openEdit(op: FinanceOperation) {
  editing.value = op
  form.value = {
    title: op.title,
    category: op.category,
    quantity: op.quantity,
    cost: op.cost,
    feeRate: op.fee_rate,
    expectedRevenue: op.expected_revenue,
    purchasedAt: isoDay(new Date(op.purchased_at)),
    note: op.note ?? '',
    syncTreasury: false,
  }
  formOpen.value = true
}

const int = (n: number | null) => Math.max(0, Math.floor(Number(n) || 0))

async function submitForm() {
  if (!guild.value) return
  const f = form.value
  const base = {
    title: f.title.trim(),
    category: f.category,
    quantity: Math.max(1, Math.floor(f.quantity || 1)),
    cost: int(f.cost),
    feeRate: Math.min(100, Math.max(0, Math.round((Number(f.feeRate) || 0) * 100) / 100)),
    expectedRevenue: int(f.expectedRevenue),
    purchasedAt: f.purchasedAt ? dayToIso(f.purchasedAt) : undefined,
    note: f.note.trim() || undefined,
  }
  saving.value = true
  try {
    if (editing.value) {
      const { cost: _cost, ...meta } = base
      const updated = await OperationsApi.update(editing.value.id, { ...meta, note: f.note.trim() })
      upsert(updated)
      toast('Operação atualizada')
    } else {
      const created = await OperationsApi.create({ guildId: guild.value.id, ...base, syncTreasury: f.syncTreasury })
      upsert(created)
      toast('Compra registrada', { text: `${created.title} · lucro esperado ${signedSilver(created.expected_profit)}` })
    }
    formOpen.value = false
  } catch (e) {
    toast('Não foi possível salvar', { tone: 'error', text: friendlyError(e) })
  } finally {
    saving.value = false
  }
}

// ---------- Movimentos (entradas e saídas) ----------
const ENTRY_KIND_OPTIONS: Array<{ value: EntryKind; label: string }> = [
  { value: 'sale', label: 'Entrada (venda)' },
  { value: 'purchase', label: 'Saída (compra)' },
  { value: 'fee', label: 'Saída (gasto extra)' },
]

const ledger = ref<FinanceOperation | null>(null)
const entryForm = ref<{ kind: EntryKind; amount: number | null; quantity: number | null; occurredAt: string; note: string; syncTreasury: boolean }>(blankEntry())

function blankEntry(syncTreasury = false) {
  return { kind: 'sale' as EntryKind, amount: null, quantity: null, occurredAt: isoDay(new Date()), note: '', syncTreasury }
}

const entryTax = computed(() =>
  ledger.value && entryForm.value.kind === 'sale' ? marketTax(Number(entryForm.value.amount) || 0, ledger.value.fee_rate) : 0,
)

const remainingQty = computed(() => (ledger.value ? Math.max(0, ledger.value.quantity - ledger.value.sold_quantity) : 0))

function openLedger(op: FinanceOperation) {
  ledger.value = op
  // Se a compra saiu da tesouraria, as vendas provavelmente voltam para ela
  entryForm.value = blankEntry(!!op.entries?.some((e) => e.tx_id))
}

function applyLedger(updated: FinanceOperation) {
  upsert(updated)
  if (ledger.value?.id === updated.id) ledger.value = updated
}

async function submitEntry() {
  const op = ledger.value
  const f = entryForm.value
  if (!op || !f.amount) return
  saving.value = true
  try {
    const updated = await OperationsApi.addEntry(op.id, {
      kind: f.kind,
      amount: Math.max(1, int(f.amount)),
      quantity: f.quantity ? Math.max(1, Math.floor(f.quantity)) : undefined,
      occurredAt: f.occurredAt ? dayToIso(f.occurredAt) : undefined,
      note: f.note.trim() || undefined,
      syncTreasury: f.syncTreasury,
    })
    applyLedger(updated)
    toast(f.kind === 'sale' ? 'Entrada lançada' : 'Saída lançada', { text: `${toSilver(int(f.amount) - entryTax.value)} · saldo ${signedSilver(updated.balance)}` })
    entryForm.value = { ...blankEntry(f.syncTreasury), kind: f.kind }
  } catch (e) {
    toast('Não foi possível lançar', { tone: 'error', text: friendlyError(e) })
  } finally {
    saving.value = false
  }
}

async function removeEntry(entry: OperationEntry) {
  const op = ledger.value
  if (!op) return
  const ok = await confirmAction({
    title: 'Excluir movimento?',
    text: `${ENTRY_LABELS[entry.kind]} de ${toSilver(entry.amount)}${entry.tx_id ? '. O lançamento na tesouraria também será removido.' : '.'}`,
    confirmLabel: 'Excluir',
    danger: true,
  })
  if (!ok) return
  try {
    applyLedger(await OperationsApi.removeEntry(op.id, entry.id))
    toast('Movimento excluído')
  } catch (e) {
    toast('Não foi possível excluir', { tone: 'error', text: friendlyError(e) })
  }
}

async function closeOp(result: 'sold' | 'cancelled') {
  const op = ledger.value
  if (!op) return
  const ok = await confirmAction({
    title: result === 'sold' ? 'Encerrar operação?' : 'Encerrar como perda?',
    text: `Resultado final: ${signedSilver(op.balance)} (esperado ${signedSilver(op.expected_profit)}).${remainingQty.value > 0 ? ` Ainda há ${remainingQty.value} un. sem venda registrada.` : ''}`,
    confirmLabel: 'Encerrar',
    danger: result === 'cancelled',
  })
  if (!ok) return
  saving.value = true
  try {
    const updated = await OperationsApi.close(op.id, result)
    applyLedger(updated)
    toast(result === 'sold' ? 'Operação encerrada' : 'Perda registrada', {
      tone: (updated.actual_profit ?? 0) >= 0 ? 'success' : 'info',
      text: `Lucro real ${signedSilver(updated.actual_profit ?? 0)}`,
    })
  } catch (e) {
    toast('Não foi possível encerrar', { tone: 'error', text: friendlyError(e) })
  } finally {
    saving.value = false
  }
}

async function reopen(op: FinanceOperation) {
  const ok = await confirmAction({
    title: 'Reabrir operação?',
    text: 'Ela volta para "em aberto" e sai do lucro realizado. Os movimentos lançados continuam.',
    confirmLabel: 'Reabrir',
  })
  if (!ok) return
  try {
    applyLedger(await OperationsApi.reopen(op.id))
    toast('Operação reaberta')
  } catch (e) {
    toast('Não foi possível reabrir', { tone: 'error', text: friendlyError(e) })
  }
}

async function remove(op: FinanceOperation) {
  const linked = op.entries?.some((e) => e.tx_id)
  const ok = await confirmAction({
    title: 'Excluir operação?',
    text: `${op.title}${linked ? '. Os lançamentos vinculados na tesouraria também serão removidos.' : '.'}`,
    confirmLabel: 'Excluir',
    danger: true,
  })
  if (!ok) return
  const prev = [...list.value]
  list.value = list.value.filter((o) => o.id !== op.id)
  try {
    await OperationsApi.remove(op.id)
    void refreshSummary()
    toast('Operação excluída')
  } catch (e) {
    list.value = prev
    toast('Não foi possível excluir', { tone: 'error', text: friendlyError(e) })
  }
}

// ---------- Exportação ----------
function exportCsv() {
  const header = ['Data compra', 'Data fim', 'Operação', 'Tipo', 'Qtd', 'Gasto', 'Gastos extras', 'Custo total', 'Taxa mercado (%)', 'Taxa paga', 'Venda esperada', 'Lucro esperado', 'Valor recebido', 'Lucro real', 'Diferença', 'Situação', 'Observação']
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = filtered.value.map((o) => [
    isoDay(new Date(o.purchased_at)),
    o.sold_at ? isoDay(new Date(o.sold_at)) : '',
    o.title,
    CATEGORY_LABELS[o.category],
    o.quantity,
    o.cost,
    o.fees,
    o.total_cost,
    String(o.fee_rate).replace('.', ','),
    o.market_tax,
    o.expected_revenue,
    o.expected_profit,
    o.actual_revenue ?? '',
    o.actual_profit ?? '',
    o.variance ?? '',
    STATUS_LABELS[o.status],
    o.note ?? '',
  ])
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `operacoes-${guild.value?.name ?? 'guilda'}-${isoDay(new Date())}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
