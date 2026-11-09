<script setup lang="ts">
import TpBulletList from '../components/atoms/tp-bullet-list.vue'
import TpEmptyState from '../components/molecules/tp-empty-state.vue'
import TpImageGallery from '../components/molecules/tp-image-gallery.vue'
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import TpSectionHeader from '../components/molecules/tp-section-header.vue'
import TpStepList from '../components/molecules/tp-step-list.vue'
import TpButton from '../components/atoms/tp-button.vue'
import TpChip from '../components/atoms/tp-chip.vue'
import TpNotification from '../components/molecules/tp-notification.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecetarioStore } from '../stores/recetario'

const props = defineProps<{ id: number }>()
const store = useRecetarioStore()
const router = useRouter()

const receta = computed(() => store.recetaPorId(props.id))

const ingredientesTexto = computed(
  () =>
    receta.value?.ingredientes.map((ri) => `${ri.cantidad} ${ri.unidad} de ${store.ingredientePorId(ri.ingredienteId)?.nombre}`) ?? [],
)

const alergenosDeLaReceta = computed(() => {
  // Esqueleto: sin tabla IngredienteAlergia poblada todavía, se simula con el aviso del Diseño 1.
  return receta.value?.nombre === 'Bowl de quinoa y aguacate' ? ['Frutos secos'] : []
})

function anadirAlCalendario() {
  // Fase de esqueleto: acción simulada hasta que exista el backend.
  router.push('/calendario')
}

function editarReceta() {
  router.push(`/recetas/${props.id}/editar`)
}
</script>

<template>
  <div v-if="receta" class="page">
    <tp-button variant="link" icon="back" to="/recetas">Volver a mis recetas</tp-button>

    <div class="layout">
      <div class="main-col">
        <tp-image-gallery :key="receta.id" :images="receta.imagenes" :alt="`Foto de ${receta.nombre}`" />
        <tp-page-header :title="receta.nombre" :subtitle="receta.descripcion" />
        <div>
          <tp-section-header title="Pasos de preparación" />
          <tp-step-list :steps="receta.pasos" />
        </div>
      </div>

      <div class="side-col">
        <div class="tags">
          <tp-chip type="strong">{{ receta.tipoComida }}</tp-chip>
          <tp-chip>{{ receta.kcal }} kcal</tp-chip>
          <tp-chip>{{ receta.tiempoPreparacionMin }} min</tp-chip>
        </div>

        <tp-notification
          v-if="alergenosDeLaReceta.length"
          type="warning"
          :title="`Contiene ${alergenosDeLaReceta.join(', ').toLowerCase()}.`"
        >
          Revisa tus alergias guardadas antes de añadirla al calendario.
        </tp-notification>

        <div>
          <tp-section-header title="Ingredientes" />
          <tp-bullet-list :items="ingredientesTexto" />
        </div>

        <tp-button @click="anadirAlCalendario">+ Añadir al calendario</tp-button>
        <tp-button variant="secondary" @click="editarReceta">Editar receta</tp-button>
      </div>
    </div>
  </div>
  <div v-else class="page">
    <tp-empty-state>
      No se ha encontrado esta receta.
      <template #action><tp-button variant="link" to="/recetas">Volver a mis recetas</tp-button></template>
    </tp-empty-state>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.main-col {
  flex: 1 1 440px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-col {
  flex: 1 1 300px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
