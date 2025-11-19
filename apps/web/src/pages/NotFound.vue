<template>
  <main class="not-found">
    <h1>404</h1>
    <h2>Página não encontrada</h2>
    <p>
      A página que você tentou acessar não existe ou foi movida.
    </p>

    <a href="/" class="not-found__link">
      Voltar para a página inicial
    </a>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
}

.not-found h1 {
  font-size: 4rem;
  font-weight: 700;
}

.not-found h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.not-found p {
  max-width: 480px;
  opacity: 0.8;
}

.not-found__link {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: 1px solid #6366f1;
  text-decoration: none;
  font-weight: 600;
}
</style>
