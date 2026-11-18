<script setup lang="ts">
import TpChip from '../components/atoms/tp-chip.vue'
import TpInput from '../components/atoms/tp-input.vue'
import TpEmptyState from '../components/molecules/tp-empty-state.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpRecipeCard from '../components/molecules/tp-recipe-card.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { MEAL_TYPES } from '@recetario/shared'
import { useRecetarioStore, type TipoComida } from '../stores/recetario'
import { sesion } from '../lib/sesion'
import { listarRecetas } from '../lib/api'

const store = useRecetarioStore()
const filtro = ref<'Todas' | TipoComida>('Todas')
const filtros: ('Todas' | TipoComida)[] = ['Todas', ...MEAL_TYPES]
const busqueda = ref('')
const cargando = ref(true)
const error = ref('')
const ids = ref<number[]>([])

// US-09: la API filtra; se guarda cada resultado en el store (sin borrar el resto) y se muestran solo los ids devueltos.
let peticion = 0
async function buscar() {
  const actual = ++peticion
  try {
    const lista = await listarRecetas({
      q: busqueda.value.trim() || undefined,
      mealType: filtro.value === 'Todas' ? undefined : filtro.value,
    })
    if (actual !== peticion) return
    lista.forEach((r) => store.guardarRecetaApi(r))
    ids.value = lista.map((r) => r.id)
    error.value = ''
  } catch (e) {
    if (actual !== peticion) return
    error.value = e instanceof Error ? e.message : 'No se han podido cargar las recetas.'
  } finally {
    if (actual === peticion) cargando.value = false
  }
}

let temporizador: ReturnType<typeof setTimeout>
watch(busqueda, () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(buscar, 300)
})
watch(filtro, buscar)
onMounted(buscar)
onUnmounted(() => clearTimeout(temporizador))

const recetasFiltradas = computed(() =>
  ids.value.map((id) => store.recetas.find((r) => r.id === id)).filter((r) => r !== undefined),
)
</script>

<template>
  <div class="page">
    <tp-page-header
      title="Mis recetas"
      :subtitle="`${recetasFiltradas.length} recetas · ajustadas a tus alergias y objetivo calórico`"
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

    <tp-empty-state v-if="cargando">Cargando recetas…</tp-empty-state>
    <tp-empty-state v-else-if="error">{{ error }}</tp-empty-state>
    <tp-empty-state v-else-if="recetasFiltradas.length === 0">No hay recetas que coincidan con la búsqueda.</tp-empty-state>
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
