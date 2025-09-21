<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { postJSON } from '@/lib/api';
import { setSession } from '@/stores/auth';
const router = useRouter();
const email = ref(''); const password = ref(''); const error = ref(''); const loading = ref(false);

async function login() {
  error.value=''; loading.value = true;
  try {
    const { token, user } = await postJSON<{token:string; user:any}>('/auth/login', { email: email.value, password: password.value });
    setSession(token, user);
    router.push('/dashboard');
  } catch (e:any) { error.value = e.message || 'Falha no login'; }
  finally { loading.value = false; }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="bg-slate-800/80 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-lg">
      <h1 class="text-3xl font-bold mb-8 text-center text-blue-400">Entrar</h1>
      <div class="space-y-5">
        <input v-model="email" type="email" placeholder="E-mail"
          class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
        <input v-model="password" type="password" placeholder="Senha"
          class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
        <button @click="login" :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 p-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </div>
  </div>
</template>
