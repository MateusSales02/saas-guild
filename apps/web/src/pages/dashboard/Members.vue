<template>
  <section class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold">Membros</h2>
      <input v-model="q" placeholder="Buscar…" class="text-sm px-3 py-1.5 rounded-lg bg-slate-800 outline-none" />
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="text-left text-xs uppercase opacity-60">
          <tr>
            <th class="py-2">Jogador</th>
            <th class="py-2">Classe</th>
            <th class="py-2">Nível</th>
            <th class="py-2">Cargo</th>
            <th class="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in filtered" :key="m.id" class="border-t border-slate-800/30">
            <td class="py-2 flex items-center gap-2">
              <img :src="m.avatar" class="w-8 h-8 rounded-xl object-cover" />
              <span class="font-medium">{{ m.name }}</span>
            </td>
            <td class="py-2">{{ m.class }}</td>
            <td class="py-2">{{ m.level }}</td>
            <td class="py-2">{{ m.role }}</td>
            <td class="py-2">
              <span :class="['px-2 py-0.5 rounded-lg text-xs', m.online ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300']">
                {{ m.online ? 'Online' : 'Offline' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const q = ref('')
const members = ref([
  { id: 1, name: 'Kael', class: 'Guerreiro', level: 62, role: 'Oficial', online: true,  avatar: 'https://i.pravatar.cc/100?img=11' },
  { id: 2, name: 'Seraph', class: 'Mago',     level: 59, role: 'Membro',  online: false, avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 3, name: 'Nyx',   class: 'Arqueira',  level: 61, role: 'Raid Lead', online: true, avatar: 'https://i.pravatar.cc/100?img=13' },
  { id: 4, name: 'Bryn',  class: 'Clérigo',   level: 58, role: 'Membro',  online: false, avatar: 'https://i.pravatar.cc/100?img=14' },
])
const filtered = computed(() =>
  members.value.filter(m =>
    (m.name + m.class + m.role).toLowerCase().includes(q.value.toLowerCase())
  )
)
</script>
