<template>
  <section class="relative overflow-hidden bg-[radial-gradient(1200px_500px_at_70%_20%,#1b2433_0%,#0d1422_45%,#0a0f1a_80%)]">
    <div class="pointer-events-none select-none">
      <div class="absolute -top-12 -left-12 w-64 h-64 rounded-full opacity-20 bg-[#C6A95D]/20 blur-3xl" />
      <div class="absolute -bottom-12 -right-12 w-96 h-96 rounded-full opacity-10 bg-[#C6A95D]/10 blur-3xl" />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C6A95D]/15 text-[#C6A95D] text-xs font-medium border border-[#C6A95D]/20 shadow-sm">
          SaaS Guild · v0.1
        </div>
        <h1 class="mt-4 text-4xl/tight md:text-5xl font-extrabold [text-shadow:0_2px_0_rgba(0,0,0,.3)]">
          Gerencie sua <span class="text-[#C6A95D] drop-shadow-[0_0_20px_rgba(198,169,93,0.25)]">Guilda</span> com
          <span class="block">precisão e estilo.</span>
        </h1>
        <p class="mt-4 text-slate-300/80 max-w-xl">
          Controle membros, organize raids, crie eventos e gerencie a tesouraria — tudo em um painel com estética medieval e performance moderna.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink to="/registrar" class="px-5 py-2.5 rounded-xl bg-[#C6A95D] text-slate-900 font-semibold shadow hover:translate-y-[1px]">
            Registrar-se
          </RouterLink>
          <RouterLink to="/login" class="px-5 py-2.5 rounded-xl border border-[#C6A95D]/40 bg-slate-900/40 hover:bg-slate-900/60">
            Entrar na Guilda
          </RouterLink>
          <RouterLink to="/dashboard" class="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800">
            Ver Dashboard
          </RouterLink>
        </div>

        <div class="mt-6 text-xs text-slate-400 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#C6A95D]"/> Sem cartas de crédito mágicas — demo local.
        </div>
      </div>

      <div class="relative">
        <div class="aspect-[16/10] rounded-[24px] border-4 border-[#8a7741] shadow-[inset_0_0_0_2px_rgba(0,0,0,.35)] bg-gradient-to-b from-slate-900 to-slate-800 p-4">
          <div class="h-full rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div class="text-sm opacity-70">Prévia do Dashboard</div>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <div class="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                <div class="text-xs uppercase opacity-60">Membros</div>
                <div class="text-xl font-bold text-[#C6A95D]">128</div>
              </div>
              <div class="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                <div class="text-xs uppercase opacity-60">Online</div>
                <div class="text-xl font-bold">17</div>
              </div>
              <div class="col-span-2 h-28 rounded-xl border border-slate-800 bg-slate-900/60 grid place-items-center">
                <div class="text-slate-400 text-sm">Gráfico de atividade</div>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -top-2 left-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_2px_0_#8a7741]"/>
        <div class="absolute -top-2 right-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_2px_0_#8a7741]"/>
        <div class="absolute -bottom-2 left-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_-2px_0_#8a7741]"/>
        <div class="absolute -bottom-2 right-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_-2px_0_#8a7741]"/>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
