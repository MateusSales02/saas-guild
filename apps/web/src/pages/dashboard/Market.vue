<template>
  <div class="page">
    <PageHeader
      eyebrow="Ferramentas"
      title="Mercado"
      subtitle="Preços por cidade, histórico de 30 dias e oportunidades de flip."
    >
      <template #actions>
        <div class="seg" role="group" aria-label="Servidor">
          <button
            v-for="r in REGIONS"
            :key="r.value"
            type="button"
            class="seg-item"
            :aria-pressed="region === r.value"
            :title="'Servidor ' + r.label"
            @click="region = r.value"
          >
            {{ r.label }}
          </button>
        </div>
        <button
          v-if="hasPriceData"
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="generatingPDF || loading"
          @click="exportPDF"
        >
          <span v-if="generatingPDF" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <AppIcon v-else name="download" :size="14" />
          {{ generatingPDF ? 'Gerando...' : 'Exportar PDF' }}
        </button>
      </template>
    </PageHeader>

    <!-- SEARCH -->
    <div class="relative z-20">
      <div class="relative">
        <svg class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
        </svg>
        <label for="market-search" class="sr-only">Buscar item</label>
        <input
          id="market-search"
          ref="searchInput"
          v-model="query"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="market-suggestions"
          :aria-expanded="dropdownOpen"
          :aria-activedescendant="dropdownOpen ? `market-option-${activeSuggestion}` : undefined"
          autocomplete="off"
          spellcheck="false"
          :placeholder="isMobile ? 'Buscar item...' : 'Buscar item... ex: Bolsa, Espada t6, 5.1 minério'"
          class="input !h-12 !rounded-xl !pl-12 !pr-24 !text-[15px]"
          @focus="showSuggestions = true"
          @blur="onSearchBlur"
          @keydown.down.prevent="moveSuggestion(1)"
          @keydown.up.prevent="moveSuggestion(-1)"
          @keydown.enter.prevent="confirmSuggestion"
          @keydown.esc="onEscape"
        />
        <button
          v-if="query"
          type="button"
          aria-label="Limpar busca"
          @mousedown.prevent="query = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-700/60 hover:text-slate-100 transition-colors"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <kbd
          v-else
          class="kbd pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 sm:inline-flex"
        >
          Ctrl K
        </kbd>
      </div>

      <!-- Sugestões -->
      <div
        v-if="dropdownOpen"
        id="market-suggestions"
        role="listbox"
        class="absolute left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-ink-850 shadow-pop"
      >
        <button
          v-for="(item, index) in suggestions"
          :id="`market-option-${index}`"
          :key="item.baseId"
          type="button"
          role="option"
          :aria-selected="index === activeSuggestion"
          @mousedown.prevent="selectFromSearch(item)"
          @mouseenter="activeSuggestion = index"
          class="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors"
          :class="index === activeSuggestion ? 'bg-gold-500/[0.08]' : ''"
        >
          <ItemIcon :item-id="buildItemId(item.baseId, suggestionTier(item))" :size="40" :alt="item.name" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-100">
              <HighlightText :text="itemName(item, suggestionTier(item))" :query="searchText" />
            </p>
            <p class="truncate text-xs text-slate-500">{{ item.category }}</p>
          </div>
          <span class="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-700">
            {{ tierRangeLabel(item) }}
          </span>
        </button>

        <button
          v-if="rawIdCandidate"
          :id="`market-option-${suggestions.length}`"
          type="button"
          role="option"
          :aria-selected="activeSuggestion === suggestions.length"
          @mousedown.prevent="selectRawId(rawIdCandidate)"
          @mouseenter="activeSuggestion = suggestions.length"
          class="flex w-full items-center gap-3 px-4 py-2 text-left border-t border-slate-800"
          :class="activeSuggestion === suggestions.length ? 'bg-gold-500/[0.08]' : ''"
        >
          <ItemIcon :item-id="rawIdCandidate" :size="40" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-100">Buscar pelo ID</p>
            <p class="font-mono text-xs text-gold-300">{{ rawIdCandidate }}</p>
          </div>
        </button>

        <div v-if="suggestions.length === 0 && !rawIdCandidate" class="px-4 py-4 text-sm text-slate-500">
          Nenhum item encontrado para "<span class="text-slate-300">{{ query }}</span>".
          <span class="block mt-1 text-xs">Tente o nome em português, como aparece no jogo.</span>
        </div>

        <p class="hidden sm:flex items-center gap-3 border-t border-slate-800 px-4 py-2 text-[10px] text-slate-500">
          <span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> navegar</span>
          <span><kbd class="kbd">Enter</kbd> selecionar</span>
          <span><kbd class="kbd">Esc</kbd> fechar</span>
        </p>
      </div>
    </div>

    <!-- FAVORITOS / RECENTES -->
    <div v-if="favorites.length || recent.length" class="flex flex-col gap-2">
      <div v-if="favorites.length" class="flex flex-wrap items-center gap-2">
        <span class="w-full sm:w-20 text-xs font-semibold text-gold-400">★ Favoritos</span>
        <div
          v-for="id in favorites"
          :key="`fav-${id}`"
          class="chip group"
          :class="{ 'chip-active': id === selectedItemId }"
        >
          <button type="button" class="flex items-center gap-1.5" :title="id" @click="selectRawId(id, true)">
            <ItemIcon :item-id="id" :size="24" />
            {{ displayName(id) }}
          </button>
          <button
            type="button"
            class="ml-0.5 rounded text-slate-500 hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
            :aria-label="`Remover ${displayName(id)} dos favoritos`"
            @click="removeFavorite(id)"
          >
            ×
          </button>
        </div>
      </div>
      <div v-if="recent.length" class="flex flex-wrap items-center gap-2">
        <span class="w-full sm:w-20 text-xs font-semibold text-slate-500">Recentes</span>
        <button
          v-for="id in recent"
          :key="`recent-${id}`"
          type="button"
          @click="selectRawId(id, true)"
          class="chip"
          :class="{ 'chip-active': id === selectedItemId }"
          :title="id"
        >
          <ItemIcon :item-id="id" :size="24" />
          {{ displayName(id) }}
        </button>
        <button type="button" class="text-[11px] text-slate-500 hover:text-slate-300 underline-offset-2 hover:underline" @click="clearRecent">
          Limpar
        </button>
      </div>
    </div>

    <!-- ITEM SELECIONADO -->
    <div v-if="currentItem" ref="panelRef" class="space-y-6 scroll-mt-4">
      <div class="panel p-4 sm:p-5">
        <!-- No mobile os controles ocupam a largura toda abaixo do ícone; no desktop ficam ao lado -->
        <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-5 gap-y-4">
          <div class="relative shrink-0 self-start sm:row-span-2">
            <div class="absolute inset-0 rounded-xl bg-gold-500/10 blur-xl" />
            <ItemIcon
              class="relative"
              :item-id="selectedItemId"
              :quality="effectiveQuality"
              :size="iconSize"
              :alt="itemName(currentItem, tier)"
              eager
            />
          </div>

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-lg sm:text-xl font-black text-slate-50 leading-tight">
                  {{ itemName(currentItem, tier) }}
                  <span class="whitespace-nowrap" :class="ENCHANT_TEXT[enchantment]">{{ tier }}.{{ enchantment }}</span>
                </h3>
                <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span>{{ currentItem.category }}</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    @click="copyId"
                    class="inline-flex items-center gap-1 tabular-nums text-slate-400 hover:text-gold-300 transition-colors break-all text-left"
                    title="Copiar ID"
                  >
                    {{ selectedItemId }}
                    <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </button>
                  <span v-if="copied" class="text-emerald-400" role="status">copiado!</span>
                </p>
              </div>

              <div class="flex shrink-0 gap-2">
                <button
                  type="button"
                  @click="toggleFavorite"
                  class="icon-btn"
                  :class="{ 'icon-btn-active': isFavorite }"
                  :aria-pressed="isFavorite"
                  :aria-label="isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                  :title="isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
                >
                  <svg class="w-5 h-5" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  @click="fetchMarket"
                  :disabled="loading"
                  class="icon-btn"
                  aria-label="Atualizar preços"
                  title="Atualizar preços"
                >
                  <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Tier / Encantamento / Qualidade -->
            <div class="col-span-2 sm:col-span-1 flex flex-wrap gap-x-6 gap-y-3">
              <div>
                <p class="field-label">Tier</p>
                <div class="flex flex-wrap gap-1" role="group" aria-label="Tier">
                  <button
                    v-for="t in currentItem.tiers"
                    :key="t"
                    type="button"
                    :aria-pressed="tier === t"
                    @click="tier = t"
                    class="seg-btn"
                    :class="{ 'seg-btn-active': tier === t }"
                  >
                    T{{ t }}
                  </button>
                </div>
              </div>

              <div v-if="maxEnchant > 0">
                <p class="field-label">Encantamento</p>
                <div class="flex flex-wrap gap-1" role="group" aria-label="Encantamento">
                  <button
                    v-for="e in maxEnchant + 1"
                    :key="e"
                    type="button"
                    :aria-pressed="enchantment === e - 1"
                    @click="enchantment = e - 1"
                    class="seg-btn"
                    :class="{ [`ench-${e - 1}`]: enchantment === e - 1 }"
                  >
                    .{{ e - 1 }}
                  </button>
                </div>
              </div>

              <div v-if="currentItem.hasQuality">
                <label for="market-quality" class="field-label block">Qualidade</label>
                <select
                  id="market-quality"
                  v-model.number="quality"
                  class="select input-sm w-40"
                >
                  <option v-for="q in QUALITIES" :key="q.value" :value="q.value">{{ q.label }}</option>
                </select>
              </div>
            </div>
        </div>
      </div>

      <!-- ERRO -->
      <div
        v-if="error"
        role="alert"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10"
      >
        <p class="flex items-center gap-2 text-sm text-rose-300">
          <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          {{ error }}
        </p>
        <button
          type="button"
          @click="fetchMarket"
          class="shrink-0 px-3 py-1.5 rounded-lg border border-rose-500/40 text-xs font-bold text-rose-200 hover:bg-rose-500/20 transition-colors"
        >
          Tentar novamente
        </button>
      </div>

      <!-- CARREGAMENTO INICIAL -->
      <div v-if="loading && !hasLoaded" class="space-y-4" aria-busy="true" aria-label="Carregando dados do mercado">
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div v-for="n in 4" :key="n" class="skeleton h-[104px] rounded-2xl" />
        </div>
        <div class="skeleton h-72 rounded-2xl" />
      </div>

      <!-- SEM DADOS -->
      <div
        v-else-if="!loading && !error && !hasAnyData"
        class="text-center py-10 px-4 rounded-xl border border-dashed border-slate-700/60 text-slate-400"
      >
        <div class="text-5xl mb-3" aria-hidden="true">📭</div>
        <h3 class="text-lg font-bold text-slate-300 mb-1">Nenhuma ordem registrada para este item</h3>
        <p class="text-sm max-w-md mx-auto">
          Os preços vêm de jogadores que usam o Albion Data Client. Itens raros podem ficar dias sem registro.
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <button v-if="enchantment > 0" type="button" class="suggest-btn" @click="enchantment = 0">Ver {{ tier }}.0</button>
          <button v-if="effectiveQuality > 1" type="button" class="suggest-btn" @click="quality = 1">Ver qualidade Normal</button>
          <button
            v-for="r in REGIONS.filter((x) => x.value !== region)"
            :key="r.value"
            type="button"
            class="suggest-btn"
            @click="region = r.value"
          >
            Ver servidor {{ r.label }}
          </button>
        </div>
      </div>

      <!-- DADOS -->
      <div
        v-else-if="hasAnyData"
        class="space-y-6 transition-opacity duration-200"
        :class="{ 'opacity-50 pointer-events-none': loading }"
        :aria-busy="loading"
      >
        <!-- RESUMO -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div class="stat-card" title="Ordem de venda mais barata: onde comprar o item agora">
            <p class="stat-label text-emerald-400">Comprar mais barato</p>
            <p class="stat-value text-emerald-300">{{ formatSilver(summary.bestSell?.sellMin) }}</p>
            <p class="stat-sub">
              <template v-if="summary.bestSell">
                <span class="font-semibold" :style="{ color: CITY_COLORS[summary.bestSell.city] }">{{ summary.bestSell.city }}</span>
                <span :class="ageClass(summary.bestSell.sellDate)"> · {{ formatAge(summary.bestSell.sellDate) }}</span>
              </template>
              <template v-else>Sem ordens de venda</template>
            </p>
          </div>

          <div class="stat-card" title="Ordem de compra mais alta: onde vender o item na hora">
            <p class="stat-label text-blue-400">Vender mais caro</p>
            <p class="stat-value text-blue-300">{{ formatSilver(summary.bestBuy?.buyMax) }}</p>
            <p class="stat-sub">
              <template v-if="summary.bestBuy">
                <span class="font-semibold" :style="{ color: CITY_COLORS[summary.bestBuy.city] }">{{ summary.bestBuy.city }}</span>
                <span :class="ageClass(summary.bestBuy.buyDate)"> · {{ formatAge(summary.bestBuy.buyDate) }}</span>
              </template>
              <template v-else>Sem ordens de compra</template>
            </p>
          </div>

          <div class="stat-card" title="Preço médio ponderado pelo volume negociado nos últimos 30 dias">
            <p class="stat-label text-gold-400">Média 30 dias</p>
            <p class="stat-value text-gold-200">
              <span v-if="loadingHistory && !summary.avg30d" class="inline-block h-7 w-24 rounded bg-slate-700/50 animate-pulse align-middle" />
              <template v-else>{{ formatSilver(summary.avg30d) }}</template>
            </p>
            <p class="stat-sub">
              {{ summary.volume30d ? `${formatCompact(summary.volume30d)} un. negociadas` : loadingHistory ? 'Carregando histórico...' : 'Sem histórico' }}
            </p>
          </div>

          <div
            class="stat-card"
            :class="summary.flip && summary.flip.profit > 0
              ? '!border-gold-500/40'
              : ''"
            title="Comprar na cidade mais barata e vender na maior ordem de compra, já descontando a taxa de venda"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="stat-label text-purple-400">Flip</p>
              <label class="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                <input v-model="premium" type="checkbox" />
                Premium
              </label>
            </div>
            <template v-if="summary.flip">
              <p class="stat-value" :class="summary.flip.profit > 0 ? 'text-purple-300' : 'text-rose-300'">
                {{ summary.flip.profit > 0 ? '+' : '' }}{{ formatSilver(summary.flip.profit) }}
                <span class="text-xs sm:text-sm font-bold">({{ (summary.flip.margin * 100).toFixed(1) }}%)</span>
              </p>
              <p class="stat-sub truncate" :title="`${summary.flip.from} → ${summary.flip.to}`">
                {{ summary.flip.from }} → {{ summary.flip.to }} · taxa {{ premium ? '4' : '8' }}%
              </p>
            </template>
            <template v-else>
              <p class="stat-value text-slate-500">—</p>
              <p class="stat-sub">Sem oportunidade entre cidades</p>
            </template>
          </div>
        </div>

        <p v-if="summaryIsStale" class="-mt-3 flex items-center gap-1.5 text-xs text-amber-200/90">
          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          Alguns preços têm mais de 24h. Confira no jogo antes de negociar.
        </p>

        <!-- TABELA POR CIDADE -->
        <div class="panel overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-700/50">
            <h3 class="flex items-center gap-2 text-sm font-bold text-slate-50">
              Preços por cidade
              <span v-if="loading" class="h-3.5 w-3.5 rounded-full border-2 border-gold-500/40 border-t-gold-400 animate-spin" />
            </h3>
            <div class="flex items-center gap-3 text-[10px] text-slate-500">
              <span class="flex items-center gap-1"><span class="age-dot age-fresh" />&lt; 2h</span>
              <span class="flex items-center gap-1"><span class="age-dot age-recent" />&lt; 24h</span>
              <span class="flex items-center gap-1"><span class="age-dot age-stale" />+ 24h</span>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[760px] text-sm">
              <thead class="bg-ink-850">
                <tr>
                  <th
                    v-for="col in COLUMNS"
                    :key="col.key"
                    scope="col"
                    :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
                    class="p-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                    :class="col.key === 'city' ? 'sticky-col bg-ink-850 text-left' : 'text-right'"
                  >
                    <button
                      type="button"
                      @click="setSort(col.key)"
                      class="w-full px-4 py-3 uppercase hover:text-gold-300 transition-colors whitespace-nowrap"
                      :class="col.key === 'city' ? 'text-left' : 'text-right'"
                      :title="col.hint"
                    >
                      {{ col.label }}
                      <span class="inline-block w-2 text-gold-400">{{ sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr
                  v-for="row in sortedRows"
                  :key="row.city"
                  class="group hover:bg-slate-700/20 transition-colors"
                  :class="{ 'text-slate-500': !rowHasData(row) }"
                >
                  <th scope="row" class="sticky-col bg-ink-900 group-hover:bg-ink-800 px-4 py-3 text-left font-semibold transition-colors">
                    <span class="flex items-center gap-2 whitespace-nowrap" :class="rowHasData(row) ? 'text-slate-200' : 'text-slate-500'">
                      <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: CITY_COLORS[row.city] }" />
                      {{ row.city }}
                    </span>
                  </th>
                  <td class="px-4 py-3 text-right">
                    <span
                      class="inline-flex items-center gap-2 tabular-nums font-semibold"
                      :class="row === summary.bestSell ? 'text-emerald-300' : rowHasData(row) ? 'text-slate-200' : ''"
                    >
                      <span v-if="row === summary.bestSell" class="best-badge bg-emerald-500/20 text-emerald-300 border-emerald-500/40">melhor</span>
                      {{ formatSilver(row.sellMin) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-400">{{ formatSilver(row.sellMax) }}</td>
                  <td class="px-4 py-3 text-right">
                    <span
                      class="inline-flex items-center gap-2 tabular-nums font-semibold"
                      :class="row === summary.bestBuy ? 'text-blue-300' : rowHasData(row) ? 'text-slate-200' : ''"
                    >
                      <span v-if="row === summary.bestBuy" class="best-badge bg-blue-500/20 text-blue-300 border-blue-500/40">melhor</span>
                      {{ formatSilver(row.buyMax) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums text-gold-200/90">{{ formatSilver(row.avg30d) }}</td>
                  <td class="px-4 py-3 text-right">
                    <span
                      v-if="row.sellMin && row.avg30d"
                      class="tabular-nums text-xs font-bold"
                      :class="row.sellMin <= row.avg30d ? 'text-emerald-400' : 'text-rose-400'"
                      :title="row.sellMin <= row.avg30d ? 'Venda mínima abaixo da média de 30 dias' : 'Venda mínima acima da média de 30 dias'"
                    >
                      {{ formatDiff(row.sellMin, row.avg30d) }}
                    </span>
                    <span v-else class="text-slate-600">—</span>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-400">{{ row.volume30d ? formatCompact(row.volume30d) : '—' }}</td>
                  <td class="px-4 py-3 text-right">
                    <span class="inline-flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
                      <span class="age-dot" :class="`age-${getFreshness(latestDate(row))}`" />
                      {{ formatAge(latestDate(row)) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- HISTÓRICO -->
        <div class="panel p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-50">Histórico de preço médio · 30 dias</h3>
            <span v-if="loadingHistory" class="h-4 w-4 rounded-full border-2 border-gold-500/40 border-t-gold-400 animate-spin" />
          </div>
          <PriceHistoryChart v-if="chartSeries.length" :series="chartSeries" />
          <div v-else-if="loadingHistory" class="skeleton h-56" />
          <p v-else class="py-10 text-center text-sm text-slate-500">
            Sem histórico de negociações nos últimos 30 dias
          </p>
        </div>
      </div>
    </div>

    <!-- CATÁLOGO -->
    <div class="panel p-4 sm:p-5">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-slate-50">
          {{ currentItem ? 'Explorar outros itens' : 'Explorar itens' }}
        </h3>
        <p v-if="!currentItem" class="mt-1 text-sm text-slate-400">
          Escolha um item abaixo ou use a busca para ver preços em todas as cidades.
        </p>
      </div>

      <!-- Grupos -->
      <div class="-mx-4 sm:mx-0 px-4 sm:px-0 mb-3 flex gap-1 overflow-x-auto no-scrollbar sm:flex-wrap" role="tablist" aria-label="Grupos de itens">
        <button
          v-for="g in ITEM_GROUPS"
          :key="g"
          type="button"
          role="tab"
          :aria-selected="browseGroup === g"
          @click="setBrowseGroup(g)"
          class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
          :class="browseGroup === g
            ? 'border-gold-500/50 bg-gold-500/10 text-gold-200'
            : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-slate-200'"
        >
          {{ g }}
        </button>
      </div>

      <!-- Categorias do grupo -->
      <div v-if="browseCategories.length > 1" class="-mx-4 sm:mx-0 px-4 sm:px-0 mb-4 flex gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap">
        <button
          v-for="c in ['', ...browseCategories]"
          :key="c || 'all'"
          type="button"
          :aria-pressed="browseCategory === c"
          @click="browseCategory = c"
          class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
          :class="browseCategory === c
            ? 'bg-slate-200 text-slate-900'
            : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'"
        >
          {{ c || 'Todas' }}
        </button>
      </div>

      <div class="space-y-5">
        <div v-for="section in browseSections" :key="section.category">
          <h4 v-if="!browseCategory" class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            {{ section.category }}
            <span class="font-normal normal-case text-slate-600">· {{ section.items.length }}</span>
          </h4>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
            <button
              v-for="item in section.items"
              :key="item.baseId"
              type="button"
              @click="selectCatalogItem(item, undefined, undefined, true)"
              class="group flex flex-col items-center gap-1 p-2 rounded-lg border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"
              :class="item.baseId === selectedBaseId
                ? 'border-gold-500/50 bg-gold-500/[0.08]'
                : 'border-white/[0.05] bg-white/[0.015] hover:border-gold-500/30 hover:bg-white/[0.03]'"
              :title="itemName(item, browseTier(item))"
            >
              <ItemIcon
                class="transition-transform group-hover:scale-110"
                :item-id="buildItemId(item.baseId, browseTier(item))"
                :size="56"
                :alt="itemName(item, browseTier(item))"
              />
              <span class="w-full line-clamp-2 text-center text-[11px] leading-tight font-medium text-slate-300">
                {{ itemName(item, browseTier(item)) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItemIcon from '@/components/market/ItemIcon.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import PriceHistoryChart from '@/components/market/PriceHistoryChart.vue'
import {
  AlbionDataApi,
  type AlbionHistoryData,
  type AlbionPriceData,
  type AlbionRegion,
} from '@/lib/api'
import {
  CATALOG,
  CITY_COLORS,
  ITEM_GROUPS,
  QUALITIES,
  REGIONS,
  TIERS,
  buildChartSeries,
  buildCityRows,
  buildItemId,
  findCatalogItem,
  formatAge,
  formatApiDate,
  formatCompact,
  formatSilver,
  getFreshness,
  hasDate,
  itemName,
  normalizeText,
  parseItemId,
  parseSearchQuery,
  searchCatalog,
  summarizeMarket,
  type CatalogItem,
  type CityPriceRow,
  type ItemGroup,
} from '@/lib/market'

/** Destaca o trecho buscado no nome do item */
const HighlightText = defineComponent({
  props: { text: { type: String, required: true }, query: { type: String, default: '' } },
  setup(props) {
    return () => {
      const needle = normalizeText(props.query)
      const index = needle ? normalizeText(props.text).indexOf(needle) : -1
      if (index < 0) return props.text
      return [
        props.text.slice(0, index),
        h('mark', { class: 'bg-transparent text-gold-300' }, props.text.slice(index, index + needle.length)),
        props.text.slice(index + needle.length),
      ]
    }
  },
})

const STORAGE_KEYS = {
  region: 'market:region',
  favorites: 'market:favorites',
  recent: 'market:recent',
}
const MAX_RECENT = 8

/** Cores de encantamento como no jogo */
const ENCHANT_TEXT = ['text-[#C6A95D]', 'text-emerald-400', 'text-sky-400', 'text-purple-400', 'text-amber-300']

type SortKey = 'city' | 'sellMin' | 'sellMax' | 'buyMax' | 'avg30d' | 'diff' | 'volume30d' | 'age'

const COLUMNS: Array<{ key: SortKey; label: string; hint: string }> = [
  { key: 'city', label: 'Cidade', hint: 'Ordenar por cidade' },
  { key: 'sellMin', label: 'Venda mín.', hint: 'Ordem de venda mais barata (preço para comprar)' },
  { key: 'sellMax', label: 'Venda máx.', hint: 'Ordem de venda mais cara' },
  { key: 'buyMax', label: 'Compra máx.', hint: 'Ordem de compra mais alta (preço para vender na hora)' },
  { key: 'avg30d', label: 'Média 30d', hint: 'Preço médio negociado nos últimos 30 dias' },
  { key: 'diff', label: 'vs média', hint: 'Venda mínima comparada à média de 30 dias' },
  { key: 'volume30d', label: 'Volume 30d', hint: 'Unidades negociadas nos últimos 30 dias' },
  { key: 'age', label: 'Atualizado', hint: 'Idade do dado mais recente' },
]

const route = useRoute()
const router = useRouter()

// ---------- Estado ----------
const region = ref<AlbionRegion>(readRegion())
const favorites = ref<string[]>(readStorage<string[]>(STORAGE_KEYS.favorites, []).filter(isKnownItemId))
const recent = ref<string[]>(readStorage<string[]>(STORAGE_KEYS.recent, []).filter(isKnownItemId))

const query = ref('')
const showSuggestions = ref(false)
const activeSuggestion = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const selectedBaseId = ref<string | null>(null)
const tier = ref(4)
const enchantment = ref(0)
const quality = ref(1)
const premium = ref(true)

const prices = ref<AlbionPriceData[]>([])
const history = ref<AlbionHistoryData[]>([])
const loading = ref(false)
const loadingHistory = ref(false)
const hasLoaded = ref(false)
const error = ref('')
const generatingPDF = ref(false)
const copied = ref(false)
const isMobile = ref(false)

const sortKey = ref<SortKey>('sellMin')
const sortDir = ref<'asc' | 'desc'>('asc')
const browseGroup = ref<ItemGroup>('Armas')
const browseCategory = ref('')

let requestId = 0

// ---------- Item selecionado ----------
const currentItem = computed<CatalogItem | null>(() => {
  if (!selectedBaseId.value) return null
  return (
    findCatalogItem(selectedBaseId.value) ?? {
      baseId: selectedBaseId.value,
      name: selectedBaseId.value.replace(/_/g, ' '),
      category: 'Item personalizado',
      group: 'Armas',
      tiers: TIERS,
      maxEnchant: 4,
      leveled: false,
      hasQuality: true,
    }
  )
})

const maxEnchant = computed(() => currentItem.value?.maxEnchant ?? 0)

// Recursos e consumíveis não têm qualidade: a API só tem dados de qualidade 1
const effectiveQuality = computed(() => (currentItem.value?.hasQuality ? quality.value : 1))

const selectedItemId = computed(() =>
  selectedBaseId.value ? buildItemId(selectedBaseId.value, tier.value, enchantment.value) : '',
)

const isFavorite = computed(() => favorites.value.includes(selectedItemId.value))
const iconSize = computed(() => (isMobile.value ? 72 : 112))

// ---------- Busca ----------
const searchText = computed(() => parseSearchQuery(query.value).text)
const suggestions = computed(() => searchCatalog(query.value, 8))

const rawIdCandidate = computed(() => {
  const q = query.value.trim().toUpperCase()
  return /^T\d_[A-Z0-9_]+(@\d)?$/.test(q) ? q : null
})

const suggestionCount = computed(() => suggestions.value.length + (rawIdCandidate.value ? 1 : 0))
const dropdownOpen = computed(() => showSuggestions.value && query.value.trim().length > 0)

watch(query, () => {
  activeSuggestion.value = 0
  showSuggestions.value = true
})

function defaultTier(item: CatalogItem): number {
  return item.tiers.includes(4) ? 4 : item.tiers[0]
}

function suggestionTier(item: CatalogItem): number {
  const { tier: t } = parseSearchQuery(query.value)
  return t && item.tiers.includes(t) ? t : defaultTier(item)
}

function tierRangeLabel(item: CatalogItem): string {
  const first = item.tiers[0]
  const last = item.tiers[item.tiers.length - 1]
  return first === last ? `T${first}` : `T${first}–T${last}`
}

function moveSuggestion(delta: number) {
  if (suggestionCount.value === 0) return
  showSuggestions.value = true
  activeSuggestion.value =
    (activeSuggestion.value + delta + suggestionCount.value) % suggestionCount.value
  nextTick(() =>
    document.getElementById(`market-option-${activeSuggestion.value}`)?.scrollIntoView({ block: 'nearest' }),
  )
}

function confirmSuggestion() {
  const item = suggestions.value[activeSuggestion.value]
  if (item) selectFromSearch(item)
  else if (rawIdCandidate.value) selectRawId(rawIdCandidate.value)
}

function onSearchBlur() {
  setTimeout(() => (showSuggestions.value = false), 120)
}

function onEscape() {
  if (dropdownOpen.value) showSuggestions.value = false
  else query.value = ''
}

function selectFromSearch(item: CatalogItem) {
  const parsed = parseSearchQuery(query.value)
  const t = parsed.tier && item.tiers.includes(parsed.tier) ? parsed.tier : undefined
  selectCatalogItem(item, t, parsed.enchantment)
  query.value = ''
  showSuggestions.value = false
  searchInput.value?.blur()
}

function selectCatalogItem(item: CatalogItem, t?: number, e?: number, scroll = false) {
  selectedBaseId.value = item.baseId
  tier.value = t ?? (item.tiers.includes(tier.value) ? tier.value : defaultTier(item))
  enchantment.value = Math.min(e ?? enchantment.value, item.maxEnchant)
  if (scroll) scrollToPanel()
}

function selectRawId(itemId: string, scroll = false) {
  const parsed = parseItemId(itemId)
  if (!parsed) return
  selectedBaseId.value = parsed.baseId
  tier.value = parsed.tier
  enchantment.value = parsed.enchantment
  query.value = ''
  showSuggestions.value = false
  if (scroll) scrollToPanel()
}

/** Leva o painel do item para a tela quando a seleção vem de baixo (catálogo) */
function scrollToPanel() {
  nextTick(() => {
    const el = panelRef.value
    if (!el) return
    const top = el.getBoundingClientRect().top
    if (top < 0 || top > window.innerHeight * 0.4) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function displayName(itemId: string): string {
  const parsed = parseItemId(itemId)
  if (!parsed) return itemId
  const item = findCatalogItem(parsed.baseId)
  const name = item ? itemName(item, parsed.tier) : parsed.baseId
  return `${name} ${parsed.tier}.${parsed.enchantment}`
}

function isKnownItemId(itemId: unknown): itemId is string {
  if (typeof itemId !== 'string') return false
  const parsed = parseItemId(itemId)
  return !!parsed && !!findCatalogItem(parsed.baseId)
}

// ---------- Catálogo ----------
const groupItems = computed(() => CATALOG.filter((i) => i.group === browseGroup.value))
const browseCategories = computed(() => [...new Set(groupItems.value.map((i) => i.category))])

const browseSections = computed(() => {
  const sections = new Map<string, CatalogItem[]>()
  for (const item of groupItems.value) {
    if (browseCategory.value && item.category !== browseCategory.value) continue
    const list = sections.get(item.category) ?? []
    list.push(item)
    sections.set(item.category, list)
  }
  return [...sections].map(([category, items]) => ({ category, items }))
})

function setBrowseGroup(group: ItemGroup) {
  browseGroup.value = group
  browseCategory.value = ''
}

function browseTier(item: CatalogItem): number {
  return item.tiers.includes(tier.value) ? tier.value : defaultTier(item)
}

// Ao trocar de item, o catálogo acompanha o grupo dele
watch(selectedBaseId, () => {
  const item = currentItem.value
  if (item && findCatalogItem(item.baseId) && item.group !== browseGroup.value) setBrowseGroup(item.group)
})

// ---------- Dados de mercado ----------
const rows = computed(() => buildCityRows(prices.value, history.value))
const summary = computed(() => summarizeMarket(rows.value, premium.value))
const chartSeries = computed(() => buildChartSeries(history.value))

const hasPriceData = computed(() => rows.value.some(rowHasData))
const hasAnyData = computed(() => hasPriceData.value || chartSeries.value.length > 0)

const summaryIsStale = computed(() => {
  const s = summary.value
  return (
    (!!s.bestSell && getFreshness(s.bestSell.sellDate) === 'stale') ||
    (!!s.bestBuy && getFreshness(s.bestBuy.buyDate) === 'stale')
  )
})

function rowHasData(row: CityPriceRow): boolean {
  return row.sellMin > 0 || row.buyMax > 0
}

async function fetchMarket() {
  const itemId = selectedItemId.value
  if (!itemId) return

  const id = ++requestId
  const q = effectiveQuality.value
  loading.value = true
  loadingHistory.value = true
  error.value = ''

  const start = new Date(Date.now() - 30 * 86_400_000)

  // Os dados anteriores ficam na tela (esmaecidos) até a resposta chegar, evitando "piscar"
  const pricesPromise = AlbionDataApi.getPrices([itemId], undefined, [q], region.value)
    .then((data) => {
      if (id === requestId) prices.value = data
    })
    .catch((e: any) => {
      if (id !== requestId) return
      prices.value = []
      const status = e?.response?.status
      error.value =
        status === 429
          ? 'Muitas consultas seguidas. Aguarde alguns segundos e tente novamente.'
          : 'Não foi possível consultar os preços agora. Verifique sua conexão e tente novamente.'
    })
    .finally(() => {
      if (id !== requestId) return
      loading.value = false
      hasLoaded.value = true
    })

  const historyPromise = AlbionDataApi.getHistory([itemId], {
    date: formatApiDate(start),
    qualities: [q],
    timeScale: 24,
    region: region.value,
  })
    .then((data) => {
      if (id === requestId) history.value = data
    })
    .catch(() => {
      // Histórico é complementar: sem ele a tabela continua útil
      if (id === requestId) history.value = []
    })
    .finally(() => {
      if (id === requestId) loadingHistory.value = false
    })

  await Promise.all([pricesPromise, historyPromise])
}

watch([selectedItemId, effectiveQuality, region], () => {
  if (!selectedItemId.value) return
  pushRecent(selectedItemId.value)
  syncRoute()
  fetchMarket()
})

watch(region, (r) => writeStorage(STORAGE_KEYS.region, r))

// ---------- Tabela ----------
function latestDate(row: CityPriceRow): string {
  const dates = [row.sellDate, row.buyDate].filter(hasDate)
  return dates.sort().pop() ?? ''
}

function ageClass(date: string): string {
  const f = getFreshness(date)
  return f === 'stale' ? 'text-rose-400' : f === 'recent' ? 'text-amber-300/80' : 'text-emerald-400/90'
}

function formatDiff(price: number, avg: number): string {
  const pct = ((price - avg) / avg) * 100
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function setSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'buyMax' || key === 'volume30d' ? 'desc' : 'asc'
  }
}

/** Valor de ordenação; null = sem dado (sempre vai para o fim, em qualquer direção) */
function sortValue(row: CityPriceRow, key: SortKey): number | string | null {
  switch (key) {
    case 'city':
      return row.city
    case 'diff':
      return row.sellMin && row.avg30d ? (row.sellMin - row.avg30d) / row.avg30d : null
    case 'age': {
      const d = latestDate(row)
      return d ? -new Date(d).getTime() : null
    }
    default:
      return row[key] || null
  }
}

const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...rows.value].sort((a, b) => {
    const va = sortValue(a, sortKey.value)
    const vb = sortValue(b, sortKey.value)
    if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1
    if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir
    if (va === vb) return 0
    return (va < vb ? -1 : 1) * dir
  })
})

// ---------- Favoritos / recentes ----------
function toggleFavorite() {
  const id = selectedItemId.value
  if (isFavorite.value) removeFavorite(id)
  else {
    favorites.value = [...favorites.value, id]
    writeStorage(STORAGE_KEYS.favorites, favorites.value)
  }
}

function removeFavorite(id: string) {
  favorites.value = favorites.value.filter((f) => f !== id)
  writeStorage(STORAGE_KEYS.favorites, favorites.value)
}

function pushRecent(id: string) {
  recent.value = [id, ...recent.value.filter((r) => r !== id)].slice(0, MAX_RECENT)
  writeStorage(STORAGE_KEYS.recent, recent.value)
}

function clearRecent() {
  recent.value = []
  writeStorage(STORAGE_KEYS.recent, [])
}

async function copyId() {
  try {
    await navigator.clipboard.writeText(selectedItemId.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard indisponível (ex: contexto inseguro)
  }
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    const value = raw ? JSON.parse(raw) : fallback
    return Array.isArray(fallback) && !Array.isArray(value) ? fallback : (value as T)
  } catch {
    return fallback
  }
}

function readRegion(): AlbionRegion {
  const value = readStorage<string>(STORAGE_KEYS.region, 'west')
  return REGIONS.some((r) => r.value === value) ? (value as AlbionRegion) : 'west'
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage indisponível
  }
}

// ---------- PDF ----------
async function exportPDF() {
  if (!currentItem.value) return
  generatingPDF.value = true
  try {
    const { downloadMarketReport } = await import('@/lib/market-pdf')
    await downloadMarketReport({
      itemId: selectedItemId.value,
      itemName: `${itemName(currentItem.value, tier.value)} ${tier.value}.${enchantment.value}`,
      quality: effectiveQuality.value,
      qualityLabel: QUALITIES.find((q) => q.value === effectiveQuality.value)?.label ?? '',
      regionLabel: REGIONS.find((r) => r.value === region.value)?.label ?? region.value,
      rows: sortedRows.value,
      summary: summary.value,
      latestDate,
    })
  } catch (e: any) {
    error.value = 'Falha ao gerar PDF: ' + (e?.message || 'erro desconhecido')
  } finally {
    generatingPDF.value = false
  }
}

// ---------- URL / atalhos ----------
function syncRoute() {
  const q = { ...route.query, item: selectedItemId.value, quality: String(effectiveQuality.value) }
  if (route.query.item === q.item && route.query.quality === q.quality) return
  router.replace({ query: q })
}

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
    searchInput.value?.select()
  }
}

let mediaQuery: MediaQueryList | null = null
function onMediaChange() {
  isMobile.value = !!mediaQuery?.matches
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  mediaQuery = window.matchMedia('(max-width: 639px)')
  onMediaChange()
  mediaQuery.addEventListener('change', onMediaChange)

  const q = Number(route.query.quality)
  if (q >= 1 && q <= 5) quality.value = q
  if (typeof route.query.item === 'string') selectRawId(route.query.item)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  mediaQuery?.removeEventListener('change', onMediaChange)
})
</script>

<style scoped>
/* Variações locais com os mesmos tokens do design system (style.css) */
.chip {
  @apply inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] py-1 pl-1 pr-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-slate-100;
}
.chip-active {
  @apply border-gold-500/50 bg-gold-500/10 text-gold-200;
}
.icon-btn {
  @apply flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-100 disabled:opacity-50;
}
.icon-btn-active {
  @apply border-gold-500/50 bg-gold-500/10 text-gold-300;
}
.field-label {
  @apply mb-1.5 text-xs font-medium text-slate-400;
}
.seg-btn {
  @apply h-8 min-w-[2.5rem] rounded-md border border-white/[0.08] bg-ink-850 px-2.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-100;
}
/* Estados ativos definidos depois de .seg-btn para sobrescrever borda/fundo/cor */
.seg-btn-active,
.ench-0 {
  @apply border-gold-500/50 bg-gold-500/10 text-gold-200;
}
.ench-1 {
  @apply border-emerald-500/50 bg-emerald-500/10 text-emerald-300;
}
.ench-2 {
  @apply border-sky-500/50 bg-sky-500/10 text-sky-300;
}
.ench-3 {
  @apply border-violet-500/50 bg-violet-500/10 text-violet-300;
}
.ench-4 {
  @apply border-amber-300/50 bg-amber-300/10 text-amber-200;
}
.stat-card {
  @apply min-w-0 rounded-2xl border border-white/[0.06] bg-ink-900/80 p-4 shadow-panel;
}
.stat-label {
  @apply text-xs font-medium;
}
.stat-value {
  @apply mt-1.5 text-lg font-semibold leading-tight tracking-tight tabular-nums sm:text-2xl;
}
.stat-sub {
  @apply mt-1 text-[11px] text-slate-500 sm:text-xs;
}
.best-badge {
  @apply rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ring-1 ring-inset;
}
.sticky-col {
  @apply sticky left-0 z-[1];
}
.suggest-btn {
  @apply h-8 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.06];
}
.age-dot {
  @apply inline-block h-2 w-2 rounded-full;
}
.age-fresh {
  @apply bg-emerald-400;
}
.age-recent {
  @apply bg-amber-400;
}
.age-stale {
  @apply bg-rose-500;
}
.age-none {
  @apply bg-slate-600;
}
</style>
