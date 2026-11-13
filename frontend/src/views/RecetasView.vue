<script setup lang="ts">
import TpChip from '../components/atoms/tp-chip.vue'
import TpInput from '../components/atoms/tp-input.vue'
import TpEmptyState from '../components/molecules/tp-empty-state.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpRecipeCard from '../components/molecules/tp-recipe-card.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import { computed, ref } from 'vue'
import { useRecetarioStore, type TipoComida } from '../stores/recetario'
import { sesion } from '../lib/sesion'

const store = useRecetarioStore()
const filtro = ref<'Todas' | TipoComida>('Todas')
const filtros: ('Todas' | TipoComida)[] = ['Todas', 'Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena']
const busqueda = ref('')

const recetasFiltradas = computed(() => {
  return store.recetas.filter((r) => {
    const coincideTipo = filtro.value === 'Todas' || r.tipoComida === filtro.value
    const coincideBusqueda = r.nombre.toLowerCase().includes(busqueda.value.trim().toLowerCase())
    return coincideTipo && coincideBusqueda
  })
})
</script>

<template>
  <div class="page">
    <tp-page-header
      title="Mis recetas"
      :subtitle="`${store.recetas.length} recetas guardadas · ajustadas a tus alergias y objetivo calórico`"
    >
      <tp-button v-if="sesion" to="/recetas/nueva">+ Nueva receta</tp-button>
    </tp-page-header>

    <div class="filters">
      <tp-input v-model="busqueda" type="text" placeholder="Buscar receta o ingrediente…" aria-label="Buscar receta" class="search" />
      <tp-chip v-for="f in filtros" :key="f" selectable :selected="filtro === f" @click="filtro = f">{{ f }}</tp-chip>
    </div>

    <div class="grid">
      <tp-recipe-card v-for="receta in recetasFiltradas" :key="receta.id" :recipe="receta" />
    </div>

    <tp-empty-state v-if="recetasFiltradas.length === 0">No hay recetas que coincidan con la búsqueda.</tp-empty-state>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search {
  flex: 1 1 100%;
  min-width: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 22px;
}

@media (min-width: 640px) {
  .search {
    flex-basis: 260px;
  }
}
</style>
