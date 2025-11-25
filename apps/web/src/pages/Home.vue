<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <!-- HERO SECTION -->
    <section class="relative overflow-hidden min-h-screen flex items-center justify-center">
      <!-- Background Effects -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-[#C6A95D]/10 rounded-full blur-3xl animate-pulse" />
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJWMTh6TTI4IDE4djE2aDJ2LTJoLTJ6bTAgMnYyaDJWMjB6bTAgNnYyaDJ2LTJ6bTAtNnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      </div>

      <div class="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#C6A95D]/20 to-indigo-500/20 border border-[#C6A95D]/30 backdrop-blur-sm animate-fade-in">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6A95D] opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[#C6A95D]"></span>
            </span>
            <span class="text-sm font-medium bg-gradient-to-r from-[#C6A95D] to-indigo-400 bg-clip-text text-transparent">
              SaaS Guild v0.1 • Gerenciamento Medieval Moderno
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-5xl md:text-7xl font-black tracking-tight animate-fade-in-up">
            <span class="block text-slate-100">Gerencie sua Guilda</span>
            <span class="block mt-2 bg-gradient-to-r from-[#C6A95D] via-amber-400 to-[#C6A95D] bg-clip-text text-transparent animate-gradient-x">
              com Precisão e Estilo
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="max-w-3xl mx-auto text-xl md:text-2xl text-slate-300 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s">
            Controle membros, organize <span class="text-[#C6A95D] font-semibold">raids épicas</span>,
            crie eventos estratégicos e gerencie a tesouraria — tudo em um painel
            com <span class="text-indigo-400 font-semibold">estética medieval</span> e performance moderna.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap justify-center items-center gap-4 animate-fade-in-up" style="animation-delay: 0.4s">
            <RouterLink
              to="/registrar"
              class="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-lg shadow-2xl shadow-[#C6A95D]/50 hover:shadow-[#C6A95D]/70 hover:scale-105 transition-all duration-300"
            >
              <span class="relative z-10">Criar Conta Grátis</span>
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-[#C6A95D] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </RouterLink>

            <RouterLink
              to="/login"
              class="px-8 py-4 rounded-2xl border-2 border-[#C6A95D]/50 bg-slate-900/50 backdrop-blur-sm text-slate-100 font-semibold text-lg hover:border-[#C6A95D] hover:bg-slate-900/70 hover:scale-105 transition-all duration-300"
            >
              Entrar na Guilda
            </RouterLink>
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap justify-center items-center gap-8 pt-12 animate-fade-in" style="animation-delay: 0.6s">
            <div class="text-center">
              <div class="text-4xl font-black bg-gradient-to-r from-[#C6A95D] to-amber-400 bg-clip-text text-transparent">
                {{ totalGuilds || '...' }}
              </div>
              <div class="text-sm text-slate-400 mt-1">{{ totalGuilds === 1 ? 'Guilda Ativa' : 'Guildas Ativas' }}</div>
            </div>
            <div class="w-px h-12 bg-slate-700" />
            <div class="text-center">
              <div class="text-4xl font-black bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                {{ totalMembers || '...' }}
              </div>
              <div class="text-sm text-slate-400 mt-1">{{ totalMembers === 1 ? 'Membro Gerenciado' : 'Membros Gerenciados' }}</div>
            </div>
            <div class="w-px h-12 bg-slate-700" />
            <div class="text-center">
              <div class="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {{ totalEvents || '...' }}
              </div>
              <div class="text-sm text-slate-400 mt-1">{{ totalEvents === 1 ? 'Evento Criado' : 'Eventos Criados' }}</div>
            </div>
          </div>
        </div>

        <!-- Dashboard Preview -->
        <div class="mt-20 animate-fade-in-up" style="animation-delay: 0.8s">
          <div class="relative mx-auto max-w-6xl">
            <!-- Glow Effect -->
            <div class="absolute -inset-4 bg-gradient-to-r from-[#C6A95D]/20 via-indigo-500/20 to-[#C6A95D]/20 rounded-3xl blur-3xl opacity-50" />

            <!-- Browser Frame -->
            <div class="relative rounded-2xl border border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              <!-- Browser Header -->
              <div class="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
                <div class="flex gap-2">
                  <div class="w-3 h-3 rounded-full bg-red-500" />
                  <div class="w-3 h-3 rounded-full bg-yellow-500" />
                  <div class="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div class="flex-1 mx-4 px-4 py-1 rounded-lg bg-slate-900/50 text-xs text-slate-400 text-center">
                  saas-guild.app/dashboard
                </div>
              </div>

              <!-- Dashboard Preview Content -->
              <div class="p-8 bg-gradient-to-br from-slate-900 to-slate-800">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-sky-500/10 border border-indigo-500/20">
                    <div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Membros</div>
                    <div class="text-3xl font-black text-indigo-400">247</div>
                  </div>
                  <div class="p-4 rounded-xl bg-gradient-to-br from-[#C6A95D]/10 to-amber-500/10 border border-[#C6A95D]/20">
                    <div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Raids</div>
                    <div class="text-3xl font-black text-[#C6A95D]">18</div>
                  </div>
                  <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Eventos</div>
                    <div class="text-3xl font-black text-emerald-400">12</div>
                  </div>
                  <div class="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Gold</div>
                    <div class="text-3xl font-black text-amber-400">890K</div>
                  </div>
                </div>

                <!-- Chart Preview -->
                <div class="h-48 rounded-xl bg-slate-950/50 border border-slate-700/50 grid place-items-center">
                  <div class="text-center">
                    <div class="text-6xl mb-2">📊</div>
                    <div class="text-sm text-slate-400">Gráficos e Analytics em Tempo Real</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section class="relative py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent pointer-events-none" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-slate-100 mb-4">
            Ferramentas Poderosas para sua Guilda
          </h2>
          <p class="text-xl text-slate-400 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar sua guilda com eficiência e estilo
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-[#C6A95D]/50 hover:shadow-2xl hover:shadow-[#C6A95D]/20 transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 grid place-items-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 class="text-2xl font-bold text-slate-100 mb-3">Gestão de Membros</h3>
            <p class="text-slate-400 leading-relaxed">
              Controle completo sobre membros, cargos, permissões e atividades. Visualize quem está online e gerencie sua equipe com facilidade.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-[#C6A95D]/50 hover:shadow-2xl hover:shadow-[#C6A95D]/20 transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C6A95D] to-amber-500 grid place-items-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              ⚔️
            </div>
            <h3 class="text-2xl font-bold text-slate-100 mb-3">Organização de Raids</h3>
            <p class="text-slate-400 leading-relaxed">
              Planeje raids épicas, distribua loot com justiça e acompanhe o progresso da sua guilda em tempo real.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-[#C6A95D]/50 hover:shadow-2xl hover:shadow-[#C6A95D]/20 transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 grid place-items-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              📅
            </div>
            <h3 class="text-2xl font-bold text-slate-100 mb-3">Calendário de Eventos</h3>
            <p class="text-slate-400 leading-relaxed">
              Crie e gerencie eventos, raids programadas e atividades. Mantenha todos informados e organizados.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-[#C6A95D]/50 hover:shadow-2xl hover:shadow-[#C6A95D]/20 transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 grid place-items-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 class="text-2xl font-bold text-slate-100 mb-3">Tesouraria</h3>
            <p class="text-slate-400 leading-relaxed">
              Gerencie o gold da guilda, registre transações e mantenha tudo transparente com relatórios detalhados.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-[#C6A95D]/50 hover:shadow-2xl hover:shadow-[#C6A95D]/20 transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 grid place-items-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 class="text-2xl font-bold text-slate-100 mb-3">Analytics & Reports</h3>
            <p class="text-slate-400 leading-relaxed">
              Dashboards intuitivos com métricas em tempo real. Acompanhe o crescimento e desempenho da sua guilda.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-[#C6A95D]/50 hover:shadow-2xl hover:shadow-[#C6A95D]/20 transition-all duration-300 hover:-translate-y-2">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 grid place-items-center text-3xl mb-6 group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h3 class="text-2xl font-bold text-slate-100 mb-3">Sistema de Builds</h3>
            <p class="text-slate-400 leading-relaxed">
              Crie e compartilhe builds para diferentes classes e specs. Organize estratégias de combate para sua equipe.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="relative py-32 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#C6A95D]/10 via-transparent to-indigo-500/10 pointer-events-none" />

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-6xl font-black text-slate-100 mb-6">
          Pronto para começar?
        </h2>
        <p class="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          Junte-se a milhares de guildas que já estão usando nossa plataforma.
          É grátis, rápido e sem cartão de crédito.
        </p>

        <div class="flex flex-wrap justify-center items-center gap-4">
          <RouterLink
            to="/registrar"
            class="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-[#C6A95D] to-amber-500 text-slate-900 font-bold text-xl shadow-2xl shadow-[#C6A95D]/50 hover:shadow-[#C6A95D]/70 hover:scale-105 transition-all duration-300"
          >
            <span class="relative z-10">Criar Conta Grátis</span>
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-[#C6A95D] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          </RouterLink>

          <RouterLink
            to="/dashboard"
            class="px-10 py-5 rounded-2xl border-2 border-slate-600 bg-slate-800/50 backdrop-blur-sm text-slate-100 font-semibold text-xl hover:border-slate-500 hover:bg-slate-800/70 hover:scale-105 transition-all duration-300"
          >
            Ver Demo
          </RouterLink>
        </div>

        <p class="mt-8 text-sm text-slate-500">
          💳 Sem cartão de crédito • ⚡ Configuração em 2 minutos • 🔒 100% seguro
        </p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="relative border-t border-slate-800 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C6A95D] to-amber-500 grid place-items-center text-2xl">
              🛡️
            </div>
            <div>
              <div class="font-black text-lg text-slate-100">Guild Mesh</div>
              <div class="text-xs text-slate-500">v0.1 Beta</div>
            </div>
          </div>

          <div class="text-sm text-slate-400 text-center">
            <div>Projeto de TCC • © 2025 SaaS Guild</div>
            <a
              href="https://github.com/MateusSales02/saas-guild"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-slate-500 hover:text-[#C6A95D] transition-colors inline-flex items-center gap-1 mt-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              github.com/MateusSales02/saas-guild
            </a>
          </div>

          <div class="flex items-center gap-4 text-sm text-slate-400">
            <a href="#" class="hover:text-[#C6A95D] transition-colors">Termos</a>
            <a href="#" class="hover:text-[#C6A95D] transition-colors">Privacidade</a>
            <a href="#" class="hover:text-[#C6A95D] transition-colors">Suporte</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { GuildsApi, MembersApi, EventsApi } from '@/lib/api'
import { auth } from '@/stores/auth'

const totalGuilds = ref(0)
const totalMembers = ref(0)
const totalEvents = ref(0)

onMounted(async () => {
  try {
    // Apenas busca dados se o usuário estiver autenticado
    if (auth.token) {
      const guilds = await GuildsApi.list()
      totalGuilds.value = guilds.length || 1

      // Busca dados da guild do usuário logado se existir
      if (auth.guild) {
        const members = await MembersApi.listByGuild(auth.guild.id)
        totalMembers.value = members.length || 0

        const events = await EventsApi.listByGuild(auth.guild.id)
        totalEvents.value = events.length || 0
      }
    } else {
      // Valores padrão para usuários não autenticados
      totalGuilds.value = 1
      totalMembers.value = 0
      totalEvents.value = 0
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    // Valores padrão em caso de erro
    totalGuilds.value = 1
    totalMembers.value = 0
    totalEvents.value = 0
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out;
}

.animate-gradient-x {
  background-size: 200% auto;
  animation: gradient-x 3s linear infinite;
}
</style>
