<template>
  <div
    class="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
    :style="{ backgroundImage: `url(${bg})` }"
  >
    <!-- Painel da arte -->
    <div
      class="relative bg-no-repeat bg-contain"
      :style="{
        backgroundImage: `url(${panel})`,
        width: panelW + 'px',
        height: panelH + 'px'
      }"
    >
      <!-- Nome do aventureiro -->
      <input
        v-model="username"
        type="text"
        autocomplete="username"
        aria-label="Nome do aventureiro"
        @keyup.enter="submit"
        :class="hitboxClass"
        :style="{
          left: (panelW/2 - inputW/2) + 'px',
          top: input1Top + 'px',
          width: inputW + 'px',
          height: inputH + 'px'
        }"
      />

      <!-- Senha mágica -->
      <input
        v-model="password"
        type="password"
        autocomplete="current-password"
        aria-label="Senha mágica"
        @keyup.enter="submit"
        :class="hitboxClass"
        :style="{
          left: (panelW/2 - inputW/2) + 'px',
          top: input2Top + 'px',
          width: inputW + 'px',
          height: inputH + 'px'
        }"
      />

      <!-- Botão "Entrar na Guilda" (transparente) -->
      <button
        type="button"
        @click="submit"
        aria-label="Entrar na Guilda"
        :class="buttonHitboxClass"
        :style="{
          left: (panelW/2 - btnW/2) + 'px',
          top: btnTop + 'px',
          width: btnW + 'px',
          height: btnH + 'px'
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import bg from '@/assets/castle-bg.png'
import panel from '@/assets/login-panel.png'

/** Medidas para casar com a arte */
const panelW = 420
const panelH = 640
const inputW = 280
const inputH = 30
const input1Top = 341
const input2Top = 426
const btnW = 290
const btnH = 52
const btnTop = 485

/** Debug: true mostra contornos das hitboxes para alinhar */
const DEBUG = false


const hitboxClass = computed(() =>
  [
    'absolute',
    'rounded',
    'outline-none',
    'px-0', 'py-0',
    'bg-transparent',
    'text-white',        // agora o texto aparece
    'caret-white',
    DEBUG ? 'ring-2 ring-emerald-400/70 bg-emerald-400/10' : ''
  ].filter(Boolean).join(' ')
)


const buttonHitboxClass = computed(() =>
  [
    'absolute',
    'rounded',
    'cursor-pointer',
    DEBUG ? 'ring-2 ring-cyan-400/70 bg-cyan-400/10' : 'opacity-0'
  ].join(' ')
)

const username = ref('')
const password = ref('')

const router = useRouter()
const route  = useRoute()

function submit () {
  if (!username.value || !password.value) {
    alert('Preencha o nome do aventureiro e a senha mágica.')
    return
  }
  // autenticação fake + redirect
  localStorage.setItem('authUser', username.value)
  const redirect = (route.query.redirect as string) || '/dashboard'
  router.replace(redirect)
}
</script>
