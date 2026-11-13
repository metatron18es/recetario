<script setup lang="ts">
import TpPageHeader from '../components/molecules/tp-page-header.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGEN_PLACEHOLDER, useRecetarioStore, type PasoPreparacion, type TipoComida } from '../stores/recetario'
import { crearReceta, listarIngredientes } from '../lib/api'
import TpButton from '../components/atoms/tp-button.vue'
import TpInput from '../components/atoms/tp-input.vue'
import TpSelect from '../components/atoms/tp-select.vue'
import TpTextarea from '../components/atoms/tp-textarea.vue'
import TpSectionHeader from '../components/molecules/tp-section-header.vue'
import TpChipGroup from '../components/molecules/tp-chip-group.vue'
import TpImageUploader from '../components/molecules/tp-image-uploader.vue'
import TpIngredientsEditor from '../components/organisms/tp-ingredients-editor.vue'
import TpStepsEditor from '../components/organisms/tp-steps-editor.vue'
import { emptyIngredientRow, type IngredientRow } from '../components/organisms/ingredient-row'

const props = defineProps<{ editId?: number }>()
const store = useRecetarioStore()
const opcionesAlergia = computed(() => store.alergiasDisponibles.map((a) => ({ id: a.id, label: a.nombre })))
const router = useRouter()

const recetaEnEdicion = computed(() => (props.editId ? store.recetaPorId(props.editId) : undefined))
const modoEdicion = computed(() => !!recetaEnEdicion.value)

const nombre = ref(recetaEnEdicion.value?.nombre ?? '')
const tipoComida = ref<TipoComida>(recetaEnEdicion.value?.tipoComida ?? 'Comida')
const tiempoPreparacionMin = ref(recetaEnEdicion.value?.tiempoPreparacionMin ?? 25)
const descripcion = ref(recetaEnEdicion.value?.descripcion ?? '')
const fotosReceta = ref<string[]>(recetaEnEdicion.value ? [...recetaEnEdicion.value.imagenes] : [])

const filas = ref<IngredientRow[]>(
  recetaEnEdicion.value
    ? recetaEnEdicion.value.ingredientes.map((ri) => ({
        ingredienteId: ri.ingredienteId,
        nombrePendiente: null,
        kcalPendiente: '',
        cantidad: String(ri.cantidad),
        unidad: ri.unidad,
        query: '',
      }))
    : [emptyIngredientRow()],
)
const pasos = ref<PasoPreparacion[]>(
  recetaEnEdicion.value?.pasos.length ? recetaEnEdicion.value.pasos.map((p) => ({ ...p })) : [{ texto: '' }],
)

const alergenosSeleccionados = ref(new Set<number>())
function toggleAlergeno(id: number) {
  if (alergenosSeleccionados.value.has(id)) alergenosSeleccionados.value.delete(id)
  else alergenosSeleccionados.value.add(id)
}

const puedeGuardar = computed(
  () =>
    !guardando.value &&
    nombre.value.trim().length > 0 &&
    filas.value.some((f) => f.ingredienteId || f.nombrePendiente) &&
    filas.value.every((f) => !f.nombrePendiente || (f.kcalPendiente !== '' && Number(f.kcalPendiente) >= 0)) &&
    pasos.value.some((p) => p.texto.trim().length > 0),
)
const guardando = ref(false)
const error = ref('')

// US-05: el catálogo viene de la API (validados + propuestos por el usuario).
onMounted(async () => {
  try {
    store.cargarCatalogo(await listarIngredientes())
  } catch (e) {
    error.value = e instanceof Error ? e.message : ''
  }
})

async function crear() {
  const pasosLimpios = pasos.value.filter((p) => p.texto.trim().length > 0)
  guardando.value = true
  error.value = ''
  try {
    const receta = await crearReceta({
      name: nombre.value.trim(),
      mealType: tipoComida.value,
      prepTimeMin: Number(tiempoPreparacionMin.value),
      description: descripcion.value,
      ingredients: filas.value
        .filter((f) => f.ingredienteId || f.nombrePendiente)
        .map((f) => ({
          ...(f.ingredienteId ? { ingredientId: f.ingredienteId } : { proposed: { name: f.nombrePendiente!, kcalPer100g: Number(f.kcalPendiente) } }),
          quantity: Number(f.cantidad),
          unit: f.unidad,
        })),
      steps: pasosLimpios.map((p) => p.texto.trim()),
    })
    // Un ingrediente propuesto acaba de crearse en la API: se recarga el catálogo para conocer su id.
    store.cargarCatalogo(await listarIngredientes())
    store.anadirRecetaApi(receta, {
      imagenes: fotosReceta.value.length ? [...fotosReceta.value] : [IMAGEN_PLACEHOLDER],
      pasos: pasosLimpios,
    })
    router.push(`/recetas/${receta.id}`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : ''
  } finally {
    guardando.value = false
  }
}

function guardar() {
  const datos = {
    nombre: nombre.value.trim(),
    tipoComida: tipoComida.value,
    tiempoPreparacionMin: tiempoPreparacionMin.value,
    descripcion: descripcion.value,
    kcal: recetaEnEdicion.value?.kcal ?? 0,
    ingredientes: filas.value
      .filter((f) => f.ingredienteId)
      .map((f) => ({ ingredienteId: f.ingredienteId!, cantidad: Number(f.cantidad) || 0, unidad: f.unidad })),
    pasos: pasos.value
      .filter((p) => p.texto.trim().length > 0)
      .map((p) => (p.imagenes?.length ? { texto: p.texto.trim(), imagenes: [...p.imagenes] } : { texto: p.texto.trim() })),
    gradiente: recetaEnEdicion.value?.gradiente ?? 'linear-gradient(135deg,var(--leaf),var(--green))',
    imagenes: fotosReceta.value.length ? [...fotosReceta.value] : [IMAGEN_PLACEHOLDER],
  }

  if (modoEdicion.value && props.editId) {
    store.actualizarReceta(props.editId, datos)
    router.push(`/recetas/${props.editId}`)
  } else {
    crear()
  }
}
</script>

<template>
  <div class="page">
    <tp-button variant="link" icon="back" :to="modoEdicion && editId ? `/recetas/${editId}` : '/recetas'">
      {{ modoEdicion ? 'Volver a la receta' : 'Volver a mis recetas' }}
    </tp-button>

    <tp-page-header :title="modoEdicion ? 'Editar receta' : 'Nueva receta'" />

    <form class="form" @submit.prevent="guardar">
      <div class="top-row">
        <tp-image-uploader v-model="fotosReceta" label="Añadir foto(s)" item-label="Foto de la receta" />
        <div class="fields">
          <tp-input id="nombre" v-model="nombre" label="Nombre de la receta" type="text" placeholder="Ej. Bowl de quinoa y aguacate" required />
          <div class="two-col">
            <tp-select id="tipo" v-model="tipoComida" label="Tipo de comida">
              <option>Desayuno</option>
              <option>Almuerzo</option>
              <option>Comida</option>
              <option>Merienda</option>
              <option>Cena</option>
            </tp-select>
            <tp-input id="tiempo" v-model="tiempoPreparacionMin" label="Tiempo (min)" type="number" min="1" />
          </div>
        </div>
      </div>

      <tp-textarea id="desc" v-model="descripcion" label="Descripción" rows="3" placeholder="Breve descripción del plato…" />

      <tp-ingredients-editor v-model="filas" />
      <tp-steps-editor v-model="pasos" />

      <div class="alergenos">
        <tp-section-header title="Alérgenos que contiene" />
        <tp-chip-group :options="opcionesAlergia" :selected="alergenosSeleccionados" @toggle="toggleAlergeno" />
      </div>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <div class="form-actions">
        <tp-button :to="modoEdicion && editId ? `/recetas/${editId}` : '/recetas'" variant="secondary">Cancelar</tp-button>
        <tp-button type="submit" :disabled="!puedeGuardar">{{ modoEdicion ? 'Guardar cambios' : 'Guardar receta' }}</tp-button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.page {
  max-width: 920px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.top-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.fields {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.two-col {
  display: flex;
  gap: 14px;
}

.two-col > * {
  flex: 1;
}

.alergenos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error {
  font-size: 13px;
  color: #b3261e;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid var(--line);
  padding-top: 24px;
}
</style>
