<template>
  <div class="relative grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
    <!-- Painel da marca (desktop) -->
    <aside class="relative hidden overflow-hidden border-r border-white/[0.06] bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-gold-500/[0.12] blur-3xl" />
        <div class="absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-indigo-500/[0.06] blur-3xl" />
        <!-- Padrão sutil de losangos, como heráldica -->
        <svg class="absolute inset-0 h-full w-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-pattern" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill="#C6A95D" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-pattern)" />
        </svg>
      </div>

      <RouterLink to="/" class="relative flex items-center gap-3">
        <svg viewBox="0 0 40 40" fill="none" class="h-10 w-10" aria-hidden="true">
          <defs>
            <linearGradient id="auth-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e8d7a6" />
              <stop offset="100%" stop-color="#a98c45" />
            </linearGradient>
          </defs>
          <path d="M20 2 35 7.5v11.2C35 28.6 28.6 35.4 20 38 11.4 35.4 5 28.6 5 18.7V7.5z" fill="#0f1218" stroke="url(#auth-gold)" stroke-width="1.6" />
          <path d="M13 25V14l7 7 7-7v11" stroke="url(#auth-gold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="font-display text-lg font-semibold tracking-wider text-slate-50">Guild Mesh</span>
      </RouterLink>

      <div class="relative max-w-md">
        <p class="eyebrow">Para guildas de Albion Online</p>
        <h2 class="mt-3 font-display text-4xl font-semibold leading-tight tracking-wide text-slate-50">
          Sua guilda, organizada como um reino.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-slate-400">
          Membros, raids, tesouraria, builds e mercado em um só painel, com preços reais do jogo.
        </p>
        <ul class="mt-8 space-y-3">
          <li v-for="f in FEATURES" :key="f.text" class="flex items-center gap-3 text-sm text-slate-300">
            <span class="icon-tile !h-8 !w-8"><AppIcon :name="f.icon" :size="15" /></span>
            {{ f.text }}
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-slate-600">Projeto de fãs, sem afiliação com a Sandbox Interactive.</p>
    </aside>

    <!-- Formulário -->
    <main class="flex items-center justify-center px-4 py-10 sm:px-8">
      <div class="w-full max-w-[26rem] animate-fade-in">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

const FEATURES: Array<{ icon: IconName; text: string }> = [
  { icon: 'users', text: 'Cargos e membros sob controle' },
  { icon: 'calendar', text: 'Agenda de raids e eventos' },
  { icon: 'coins', text: 'Tesouraria com histórico e relatórios' },
  { icon: 'calculator', text: 'Mercado e calculadora de craft' },
]
</script>
