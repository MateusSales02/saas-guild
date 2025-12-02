<!-- Teste simples para verificar se o modal abre -->
<template>
  <section class="p-6">
    <h1 class="text-2xl text-white mb-4">Test Items Page</h1>
    <button
      @click="showModal = true"
      class="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Abrir Modal
    </button>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div class="bg-slate-900 p-6 rounded-lg max-w-md">
        <h2 class="text-white text-xl mb-4">Modal Teste</h2>
        <p class="text-slate-300 mb-4">Status: {{ status }}</p>
        <div class="flex gap-2">
          <button
            @click="testExportJSON"
            class="px-4 py-2 bg-green-500 text-white rounded"
          >
            Teste JSON
          </button>
          <button
            @click="showModal = false"
            class="px-4 py-2 bg-red-500 text-white rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const status = ref('Pronto')

function testExportJSON() {
  try {
    status.value = 'Gerando JSON...'

    const testData = {
      test: 'data',
      items: Array.from({ length: 10 }, (_, i) => ({
        id: `T4_ITEM_${i}`,
        name: `Item ${i}`
      }))
    }

    const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'test.json'
    link.click()
    URL.revokeObjectURL(url)

    status.value = 'JSON baixado!'
  } catch (e: any) {
    status.value = 'Erro: ' + e.message
    console.error(e)
  }
}
</script>
