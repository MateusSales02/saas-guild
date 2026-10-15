<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Atmosfera -->
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[900px]" aria-hidden="true">
      <div class="absolute left-1/2 top-[-280px] h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-gold-500/[0.09] blur-3xl" />
      <div class="absolute right-[-200px] top-[200px] h-[400px] w-[500px] rounded-full bg-indigo-500/[0.05] blur-3xl" />
    </div>

    <!-- NAVEGAÇÃO -->
    <header class="relative z-10">
      <nav class="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <RouterLink to="/" class="flex items-center gap-2.5">
          <BrandMark class="h-9 w-9" />
          <span class="font-display text-lg font-semibold tracking-wider text-slate-50">Guild Mesh</span>
        </RouterLink>
        <div class="flex items-center gap-2">
          <RouterLink to="/login" class="btn btn-ghost btn-sm">Entrar</RouterLink>
          <RouterLink to="/registrar" class="btn btn-secondary btn-sm hidden sm:inline-flex">Criar conta</RouterLink>
        </div>
      </nav>
    </header>

    <!-- HERO -->
    <section class="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-12 text-center sm:px-6 sm:pt-20">
      <span class="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/[0.06] px-3.5 py-1.5 text-xs font-medium text-gold-200">
        <span class="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(198,169,93,0.9)]" />
        SaaS Guild v0.1 · Feito para guildas de Albion Online
      </span>

      <h1 class="mx-auto mt-8 max-w-4xl font-display text-[40px] font-semibold leading-[1.1] tracking-wide text-slate-50 sm:text-6xl">
        Gerencie sua Guilda
        <span class="mt-2 block bg-gradient-to-b from-gold-100 via-gold-300 to-gold-600 bg-clip-text text-transparent">com precisão e estilo</span>
      </h1>

      <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
        Controle membros, organize raids, acompanhe a tesouraria e encontre os crafts mais lucrativos
        com preços reais do mercado, tudo em um só painel.
      </p>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
        <RouterLink to="/registrar" class="btn btn-primary !h-12 !px-7 !text-base">
          Criar Conta Grátis
          <AppIcon name="arrow-right" :size="17" />
        </RouterLink>
        <RouterLink to="/login" class="btn btn-secondary !h-12 !px-7 !text-base">Entrar na Guilda</RouterLink>
      </div>

      <!-- Prévia do painel -->
      <div class="relative mx-auto mt-20 max-w-5xl">
        <div class="absolute -inset-x-10 -top-10 bottom-0 rounded-[40px] bg-gold-500/[0.06] blur-3xl" aria-hidden="true" />
        <div class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900 text-left shadow-pop">
          <div class="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <span class="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span class="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span class="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span class="mx-auto rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-slate-500">guildmesh.app/dashboard</span>
          </div>
          <div class="grid grid-cols-[180px_minmax(0,1fr)] max-md:grid-cols-1">
            <!-- Barra lateral -->
            <div class="hidden border-r border-white/[0.06] p-4 md:block">
              <div class="mb-5 flex items-center gap-2">
                <BrandMark class="h-6 w-6" />
                <span class="font-display text-xs font-semibold tracking-wider text-slate-200">Guild Mesh</span>
              </div>
              <div v-for="(item, i) in PREVIEW_NAV" :key="item.label" class="mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs" :class="i === 0 ? 'bg-gold-500/10 text-gold-100' : 'text-slate-500'">
                <AppIcon :name="item.icon" :size="13" /> {{ item.label }}
              </div>
            </div>
            <!-- Conteúdo -->
            <div class="p-5 sm:p-6">
              <p class="eyebrow !text-[10px]">Ordem do Leão</p>
              <p class="font-display text-xl font-semibold tracking-wide text-slate-50">Visão geral</p>
              <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div v-for="kpi in PREVIEW_KPIS" :key="kpi.label" class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div class="flex items-center justify-between text-[11px] text-slate-500">
                    {{ kpi.label }}
                    <AppIcon :name="kpi.icon" :size="13" class="text-gold-400" />
                  </div>
                  <div class="mt-1.5 text-xl font-semibold tabular-nums" :class="kpi.gold ? 'text-gold-200' : 'text-slate-50'">{{ kpi.value }}</div>
                </div>
              </div>
              <div class="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                <div class="mb-3 flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-200">Evolução da tesouraria</span>
                  <span class="text-emerald-300">+12,4% no mês</span>
                </div>
                <svg viewBox="0 0 600 120" class="h-28 w-full" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="home-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#C6A95D" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#C6A95D" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path :d="`${PREVIEW_LINE} L600,120 L0,120 Z`" fill="url(#home-area)" />
                  <path :d="PREVIEW_LINE" fill="none" stroke="#C6A95D" stroke-width="2.5" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RECURSOS -->
    <section class="relative z-10 border-t border-white/[0.05] py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <p class="eyebrow">Tudo em um lugar</p>
          <h2 class="mt-3 font-display text-3xl font-semibold tracking-wide text-slate-50 sm:text-4xl">Ferramentas para guildas que jogam sério</h2>
          <p class="mt-4 text-slate-400">Da agenda da raid ao lucro do refino: menos planilhas, mais tempo em jogo.</p>
        </div>

        <div class="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="f in FEATURES" :key="f.title" class="group bg-ink-900 p-7 transition-colors hover:bg-ink-850">
            <span class="icon-tile !h-10 !w-10 transition-colors group-hover:border-gold-500/40">
              <AppIcon :name="f.icon" :size="19" />
            </span>
            <h3 class="mt-5 flex items-center gap-2 text-base font-semibold text-slate-100">
              {{ f.title }}
              <span v-if="f.badge" class="badge badge-gold">{{ f.badge }}</span>
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CHAMADA FINAL -->
    <section class="relative z-10 py-24">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div class="divider-gold mx-auto mb-12 max-w-xs" />
        <h2 class="font-display text-3xl font-semibold tracking-wide text-slate-50 sm:text-5xl">Pronto para começar?</h2>
        <p class="mx-auto mt-5 max-w-xl text-slate-400">
          Crie a guilda, convide os membros e tenha tudo organizado ainda hoje.
        </p>
        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          <RouterLink to="/registrar" class="btn btn-primary !h-12 !px-7 !text-base">Criar Conta Grátis</RouterLink>
          <RouterLink to="/dashboard" class="btn btn-secondary !h-12 !px-7 !text-base">Ver Demo</RouterLink>
        </div>
        <p class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span class="flex items-center gap-1.5"><AppIcon name="wallet" :size="13" /> Sem cartão de crédito</span>
          <span class="flex items-center gap-1.5"><AppIcon name="clock" :size="13" /> Configuração em 2 minutos</span>
          <span class="flex items-center gap-1.5"><AppIcon name="lock" :size="13" /> 100% seguro</span>
        </p>
      </div>
    </section>

    <!-- RODAPÉ -->
    <footer class="relative z-10 border-t border-white/[0.05] py-10">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <div class="flex items-center gap-2.5">
          <BrandMark class="h-8 w-8" />
          <div>
            <p class="font-display text-sm font-semibold tracking-wider text-slate-100">Guild Mesh</p>
            <p class="text-[11px] text-slate-500">v0.1 Beta</p>
          </div>
        </div>
        <div class="text-center text-xs text-slate-500">
          <p>Projeto de TCC · © {{ new Date().getFullYear() }} SaaS Guild</p>
          <a href="https://github.com/MateusSales02/saas-guild" target="_blank" rel="noopener noreferrer" class="mt-1 inline-flex items-center gap-1 hover:text-gold-300">
            github.com/MateusSales02/saas-guild <AppIcon name="external" :size="11" />
          </a>
        </div>
        <p class="max-w-[220px] text-center text-[11px] text-slate-600 md:text-right">
          Projeto de fãs, sem afiliação com a Sandbox Interactive.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

/** Brasão da marca */
const BrandMark = defineComponent({
  setup(_, { attrs }) {
    return () =>
      h('svg', { viewBox: '0 0 40 40', fill: 'none', 'aria-hidden': 'true', ...attrs }, [
        h('path', { d: 'M20 2 35 7.5v11.2C35 28.6 28.6 35.4 20 38 11.4 35.4 5 28.6 5 18.7V7.5z', fill: '#0f1218', stroke: '#C6A95D', 'stroke-width': '1.6' }),
        h('path', { d: 'M13 25V14l7 7 7-7v11', stroke: '#dcc27c', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      ])
  },
})

const PREVIEW_NAV: Array<{ icon: IconName; label: string }> = [
  { icon: 'dashboard', label: 'Visão geral' },
  { icon: 'users', label: 'Membros' },
  { icon: 'swords', label: 'Raids' },
  { icon: 'coins', label: 'Tesouraria' },
  { icon: 'market', label: 'Mercado' },
  { icon: 'calculator', label: 'Calculadora' },
]

const PREVIEW_KPIS: Array<{ icon: IconName; label: string; value: string; gold?: boolean }> = [
  { icon: 'users', label: 'Membros', value: '247' },
  { icon: 'swords', label: 'Raids', value: '18' },
  { icon: 'calendar', label: 'Eventos', value: '12' },
  { icon: 'coins', label: 'Gold', value: '890K', gold: true },
]

// Curva fixa da prévia (ilustrativa)
const PREVIEW_LINE = 'M0,96 L50,90 L100,92 L150,80 L200,82 L250,70 L300,64 L350,68 L400,52 L450,48 L500,34 L550,30 L600,18'

const FEATURES: Array<{ icon: IconName; title: string; text: string; badge?: string }> = [
  { icon: 'users', title: 'Gestão de membros', text: 'Cargos, permissões e histórico de cada jogador, com busca e filtros.' },
  { icon: 'swords', title: 'Raids e eventos', text: 'Agenda com confirmações, recorrência e contagem regressiva para a próxima incursão.' },
  { icon: 'coins', title: 'Tesouraria', text: 'Entradas e saídas registradas, saldo diário em gráfico e relatórios em PDF.' },
  { icon: 'hammer', title: 'Builds da guilda', text: 'Monte equipamentos com ícones reais e veja o custo estimado no mercado.' },
  { icon: 'market', title: 'Mercado em tempo real', text: 'Preços das 8 cidades, histórico de 30 dias e oportunidades de flip.', badge: 'Novo' },
  { icon: 'calculator', title: 'Calculadora de craft', text: 'Encontre refinos e crafts lucrativos com retorno de recursos e taxas do jogo.', badge: 'Novo' },
]
</script>
