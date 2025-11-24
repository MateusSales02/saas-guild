<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthApi } from '@/lib/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const nickname = ref('')
const loading = ref(false)
const error = ref('')

async function register() {
  error.value = ''
  loading.value = true
  try {
    // agora o backend SEMPRE cria um leader
    await AuthApi.register(email.value, password.value, nickname.value)
    router.push('/dashboard') // redireciona após criar conta
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ??
      e?.message ??
      'Falha no registro'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="bg-slate-800/80 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-lg">
      <h1 class="text-3xl font-bold mb-8 text-center text-blue-400">
        Criar conta de líder
      </h1>

      <div class="space-y-5">
        <div>
          <label class="block text-sm mb-2">E-mail</label>
          <input
            v-model="email"
            type="email"
            placeholder="voce@email.com"
            class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm mb-2">Senha</label>
          <input
            v-model="password"
            type="password"
            placeholder="mín. 6 caracteres"
            class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm mb-2">Nome da Guilda</label>
          <input
            v-model="nickname"
            type="text"
            placeholder="Ex: Cavaleiros do Apocalipse"
            class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button
          @click="register"
          :disabled="loading || !email || !password || !nickname"
          class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 p-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50"
        >
          {{ loading ? 'Criando conta...' : 'Registrar-se' }}
        </button>
      </div>
    </div>
  </div>
</template>
