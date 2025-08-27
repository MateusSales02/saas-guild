<template>
  <div
    class="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
    :style="{ backgroundImage: `url(${bg})` }"
  >
    <!-- Painel -->
    <div
      class="relative bg-no-repeat bg-contain"
      :style="{
        backgroundImage: `url(${panel})`,
        width: panelW + 'px',
        height: panelH + 'px'
      }"
    >
      <!-- 🔸 Hitboxes invisíveis (inputs + botão) -->
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
import bg from '@/assets/castle-bg.png'
import panel from '@/assets/login-panel.png'

/**
 * ⚙️ Ajustes finos (em pixels) para casar exatamente com a arte.
 * Se o painel parecer maior/menor, ajuste panelW/panelH e os tops.
 */
const panelW = 420   // largura do painel na tela
const panelH = 640   // altura do painel na tela

const inputW = 280   // largura das caixas de texto na arte
const inputH = 30    // altura das caixas de texto na arte
const input1Top = 341 // Y do 1º input (abaixo do "Nome do aventureiro")
const input2Top = 426 // Y do 2º input ("Senha mágica")

const btnW = 290     // largura do botão verde na arte
const btnH = 52      // altura do botão
const btnTop = 485   // Y do botão "Entrar na Guilda"

/**
 * 🔍 Modo debug: true mostra contornos semitransparentes
 * para ajudar a alinhar. Em produção deixe false.
 */
const DEBUG = false

const hitboxClass = computed(() =>
  [
    'absolute',
    'rounded',
    'outline-none',
    'px-0', 'py-0',
    'bg-transparent', 'text-transparent',
    'caret-white', // caret visível mesmo com texto transparente
    DEBUG ? 'ring-2 ring-emerald-400/70 bg-emerald-400/10' : 'opacity-0 focus:opacity-0'
  ].join(' ')
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

function submit () {
  if (!username.value || !password.value) {
    // você pode trocar por um toast
    alert('Preencha o nome do aventureiro e a senha mágica.')
    return
  }
  // TODO: chamar sua API/Pinia aqui
  alert(`Bem-vindo, ${username.value}!`)
}
</script>
