<template>
  <div class="min-h-screen w-screen flex items-center justify-center bg-[radial-gradient(1200px_500px_at_80%_20%,#1b2433_0%,#0d1422_45%,#0a0f1a_80%)]">
    <div class="relative max-w-md w-full p-6 rounded-2xl border-4 border-[#8a7741] bg-slate-900/60 backdrop-blur shadow-xl">
      <h1 class="text-2xl font-bold text-[#C6A95D] mb-4">Forjar Novo Aventureiro</h1>

      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="text-sm opacity-80">Nome do aventureiro</label>
          <input v-model="username" class="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 ring-[#C6A95D]/60"/>
        </div>

        <div>
          <label class="text-sm opacity-80">E-mail</label>
          <input v-model="email" type="email" class="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 ring-[#C6A95D]/60"/>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-sm opacity-80">Senha</label>
            <input v-model="password" type="password" class="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 ring-[#C6A95D]/60"/>
          </div>
          <div>
            <label class="text-sm opacity-80">Confirmar senha</label>
            <input v-model="confirm" type="password" class="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:ring-2 ring-[#C6A95D]/60"/>
          </div>
        </div>

        <button class="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#C6A95D] text-slate-900 font-semibold shadow-[0_6px_0_#8a7741] active:translate-y-[2px] active:shadow-[0_4px_0_#8a7741]">
          Registrar-se
        </button>

        <p class="text-xs text-slate-400 text-center">
          Já tem conta? <RouterLink to="/login" class="text-[#C6A95D] underline">Entrar</RouterLink>
        </p>
      </form>

      <!-- rebites -->
      <div class="absolute -top-2 left-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_2px_0_#8a7741]"/>
      <div class="absolute -top-2 right-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_2px_0_#8a7741]"/>
      <div class="absolute -bottom-2 left-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_-2px_0_#8a7741]"/>
      <div class="absolute -bottom-2 right-6 w-3 h-3 rounded-full bg-[#C6A95D] shadow-[0_-2px_0_#8a7741]"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')

function submit () {
  if (!username.value || !email.value || !password.value || password.value !== confirm.value) {
    alert('Preencha todos os campos e confirme a senha corretamente.')
    return
  }
  localStorage.setItem('authUser', username.value)
  router.push('/dashboard')
}
</script>
