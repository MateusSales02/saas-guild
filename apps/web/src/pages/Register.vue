<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { postJSON } from '@/lib/api';
import { setSession } from '@/stores/auth';

const router = useRouter();
const email = ref(''); const password = ref('');
const nickname = ref(''); const role = ref('membro');
const loading = ref(false); const error = ref('');

async function register() {
  error.value = ''; loading.value = true;
  try {
    const { token, user } = await postJSON<{token:string; user:any}>('/auth/register', {
      email: email.value, password: password.value, nickname: nickname.value, role: role.value
    });
    setSession(token, user);
    router.push('/dashboard');
  } catch (e:any) { error.value = e.message || 'Falha no registro'; }
  finally { loading.value = false; }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="bg-slate-800/80 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-lg">
      <h1 class="text-3xl font-bold mb-8 text-center text-blue-400">Criar conta</h1>

      <div class="space-y-5">
        <div>
          <label class="block text-sm mb-2">E-mail</label>
          <input v-model="email" type="email" placeholder="voce@email.com"
            class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div>
          <label class="block text-sm mb-2">Senha</label>
          <input v-model="password" type="password" placeholder="mín. 6 caracteres"
            class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-2">Nickname</label>
            <input v-model="nickname" type="text" placeholder="Seu apelido"
              class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          <div>
            <label class="block text-sm mb-2">Cargo</label>
            <select v-model="role"
              class="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="membro">Membro</option>
              <option value="líder">Líder</option>
              <option value="oficial">Oficial</option>
            </select>
          </div>
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button @click="register" :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 p-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50">
          {{ loading ? 'Criando conta...' : 'Registrar-se' }}
        </button>
      </div>
    </div>
  </div>
</template>
