<script setup lang="ts">
import TpChecklistGroup from '../components/organisms/tp-checklist-group.vue'
import TpChecklistItem from '../components/molecules/tp-checklist-item.vue'
import TpEmptyState from '../components/molecules/tp-empty-state.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import { computed } from 'vue'
import { useRecetarioStore } from '../stores/recetario'

const store = useRecetarioStore()

// Categorización simple para el esqueleto; en el backend real vendría del catálogo de ingredientes.
const CATEGORIAS: Record<string, string[]> = {
  'Frutas y verduras': ['Aguacate', 'Tomate cherry', 'Lima'],
  'Legumbres y cereales': ['Quinoa', 'Garbanzos cocidos', 'Avena', 'Lentejas'],
  'Proteína y lácteos': ['Huevo', 'Salmón', 'Pollo'],
  Despensa: ['Aceite de oliva virgen extra', 'Hummus'],
}

const grupos = computed(() => {
  return Object.entries(CATEGORIAS)
    .map(([nombre, nombresIngrediente]) => {
      const items = store.listaDeLaCompra.filter((item) => nombresIngrediente.includes(item.ingrediente.nombre))
      return { nombre, items }
    })
    .filter((g) => g.items.length > 0)
})

const pendientesTotal = computed(() => {
  return store.listaDeLaCompra.filter((item) => !store.comprados.has(item.ingrediente.id)).length
})
</script>

<template>
  <div class="page">
    <tp-page-header
      title="Lista de la compra"
      :subtitle="`Generada a partir del calendario de esta semana · ${pendientesTotal} pendientes`"
    >
      <tp-button>Compartir lista</tp-button>
    </tp-page-header>

    <tp-checklist-group
      v-for="grupo in grupos"
      :key="grupo.nombre"
      :title="grupo.nombre"
      :hint="`${grupo.items.filter((i) => !store.comprados.has(i.ingrediente.id)).length} pendientes`"
    >
      <tp-checklist-item
        v-for="item in grupo.items"
        :key="item.ingrediente.id"
        :label="item.ingrediente.nombre"
        :detail="`${item.cantidad} ${item.unidad}`"
        :model-value="store.comprados.has(item.ingrediente.id)"
        @update:model-value="store.toggleComprado(item.ingrediente.id)"
      />
    </tp-checklist-group>

    <tp-empty-state v-if="grupos.length === 0">Todavía no hay recetas planificadas en el calendario esta semana.</tp-empty-state>
  </div>
</template>

<style scoped>
.page {
  max-width: 760px;
}
</style>
