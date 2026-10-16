<template>
  <div class="min-h-screen lg:pl-[17rem]">
    <!-- Fundo do drawer no mobile -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- SIDEBAR -->
    <aside
      id="app-sidebar"
      class="fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-white/[0.06] bg-ink-900/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0 shadow-pop' : '-translate-x-full'"
      aria-label="Navegação principal"
    >
      <!-- Marca -->
      <div class="flex h-16 shrink-0 items-center gap-3 px-5">
        <BrandMark class="h-9 w-9" />
        <div class="min-w-0">
          <p class="font-display text-[15px] font-semibold leading-none tracking-wider text-slate-50">Guild Mesh</p>
          <p class="mt-1 truncate text-[11px] text-slate-500">{{ guildName }}</p>
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-icon btn-sm ml-auto lg:hidden"
          aria-label="Fechar menu"
          @click="sidebarOpen = false"
        >
          <AppIcon name="x" />
        </button>
      </div>
      <div class="divider-gold mx-5 w-auto" />

      <!-- Navegação -->
      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div v-for="section in sections" :key="section.title">
          <p class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-eyebrow text-slate-600">{{ section.title }}</p>
          <div class="space-y-0.5">
            <SidebarLink
              v-for="link in section.links"
              :key="link.label"
              :icon="link.icon"
              :label="link.label"
              :to="link.to"
              :exact="link.exact"
              :badge="link.badge"
            />
          </div>
        </div>
      </nav>

      <!-- Usuário -->
      <div class="shrink-0 border-t border-white/[0.06] p-3">
        <div class="flex items-center gap-3 rounded-xl px-2 py-2">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gradient-to-b from-gold-500/20 to-gold-500/5 text-xs font-bold text-gold-200">
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-100">{{ auth.user?.nickname ?? 'Jogador' }}</p>
            <p class="truncate text-[11px] text-slate-500">{{ roleLabel }}</p>
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-icon btn-sm hover:!text-rose-300"
            aria-label="Sair da conta"
            title="Sair"
            @click="logout"
          >
            <AppIcon name="logout" />
          </button>
        </div>
      </div>
    </aside>

    <!-- TOPO (mobile) -->
    <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-ink-950/80 px-4 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        class="btn btn-ghost btn-icon btn-sm"
        aria-label="Abrir menu"
        aria-controls="app-sidebar"
        :aria-expanded="sidebarOpen"
        @click="sidebarOpen = true"
      >
        <AppIcon name="menu" />
      </button>
      <BrandMark class="h-7 w-7" />
      <span class="font-display text-sm font-semibold tracking-wider text-slate-100">Guild Mesh</span>
    </header>

    <main class="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <RouterView v-slot="{ Component, route: current }">
        <component :is="Component" :key="current.path" />
      </RouterView>
    </main>

    <FeedbackHost />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import SidebarLink from '@/components/SidebarLink.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FeedbackHost from '@/components/ui/FeedbackHost.vue'
import type { IconName } from '@/components/ui/icons'
import { auth, clearSession, hasAuditAccess } from '@/stores/auth'

/** Brasão da marca: escudo dourado com monograma */
const BrandMark = defineComponent({
  setup(_, { attrs }) {
    return () =>
      h('svg', { viewBox: '0 0 40 40', fill: 'none', 'aria-hidden': 'true', ...attrs }, [
        h('defs', [
          h('linearGradient', { id: 'brand-gold', x1: '0', y1: '0', x2: '0', y2: '1' }, [
            h('stop', { offset: '0%', 'stop-color': '#e8d7a6' }),
            h('stop', { offset: '100%', 'stop-color': '#a98c45' }),
          ]),
        ]),
        h('path', {
          d: 'M20 2 35 7.5v11.2C35 28.6 28.6 35.4 20 38 11.4 35.4 5 28.6 5 18.7V7.5z',
          fill: '#0f1218',
          stroke: 'url(#brand-gold)',
          'stroke-width': '1.6',
        }),
        h('path', {
          d: 'M13 25V14l7 7 7-7v11',
          stroke: 'url(#brand-gold)',
          'stroke-width': '2.2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
      ])
  },
})

interface NavLink {
  icon: IconName
  label: string
  to: RouteLocationRaw
  exact?: boolean
  badge?: string
}

const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)

const sections = computed<Array<{ title: string; links: NavLink[] }>>(() => [
  {
    title: 'Guilda',
    links: [
      { icon: 'dashboard', label: 'Visão geral', to: { name: 'dashboard.overview' }, exact: true },
      { icon: 'users', label: 'Membros', to: { name: 'members' } },
      { icon: 'swords', label: 'Raids', to: { name: 'raids' } },
      { icon: 'calendar', label: 'Eventos', to: { name: 'events' } },
      { icon: 'coins', label: 'Tesouraria', to: { name: 'treasury' } },
      { icon: 'wallet', label: 'Compras e lucros', to: { name: 'operations' } },
    ],
  },
  {
    title: 'Ferramentas',
    links: [
      { icon: 'hammer', label: 'Builds', to: { name: 'builds' } },
      { icon: 'market', label: 'Mercado', to: { name: 'market' } },
      { icon: 'calculator', label: 'Calculadora', to: { name: 'calculator' } },
      { icon: 'box', label: 'Catálogo de itens', to: { name: 'items' } },
    ],
  },
  ...(hasAuditAccess()
    ? [{ title: 'Administração', links: [{ icon: 'list' as IconName, label: 'Auditoria', to: { name: 'audit-logs' } }] }]
    : []),
])

const guildName = computed(() => auth.guild?.name ?? 'Sem guilda')

const initials = computed(() => {
  const name = auth.user?.nickname?.trim() || '?'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
})

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  OWNER: 'Líder da guilda',
  LEADER: 'Líder da guilda',
  OFFICER: 'Oficial',
  MEMBER: 'Membro',
}
const roleLabel = computed(() => ROLE_LABELS[String(auth.user?.role ?? '').toUpperCase()] ?? auth.user?.role ?? '')

// Fecha o drawer ao navegar (mobile)
watch(() => route.fullPath, () => (sidebarOpen.value = false))

function logout() {
  clearSession()
  router.push('/login')
}
</script>
