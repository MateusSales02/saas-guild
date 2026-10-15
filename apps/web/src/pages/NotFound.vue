<template>
  <main class="not-found relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
    <div class="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />
    <h1 class="relative bg-gradient-to-b from-gold-100 to-gold-600 bg-clip-text font-display text-8xl font-semibold tracking-wider text-transparent">404</h1>
    <h2 class="relative mt-4 font-display text-2xl font-semibold tracking-wide text-slate-50">Página não encontrada</h2>
    <p class="relative mt-3 max-w-md text-slate-400">A página que você tentou acessar não existe ou foi movida.</p>
    <a href="/" class="not-found__link btn btn-secondary relative mt-8">Voltar para a página inicial</a>
  </main>
</template>
