<script setup lang="ts">
import { computed } from 'vue'
import { UNIDADES, useRecetarioStore } from '../../stores/recetario'
import TpButton from '../atoms/tp-button.vue'
import TpInput from '../atoms/tp-input.vue'
import TpSelect from '../atoms/tp-select.vue'
import TpAutocomplete from '../molecules/tp-autocomplete.vue'
import TpSectionHeader from '../molecules/tp-section-header.vue'
import { emptyIngredientRow, type IngredientRow } from './ingredient-row'

/** Filas de ingredientes (`v-model`): ingrediente elegido o propuesto, cantidad y unidad. */
const filas = defineModel<IngredientRow[]>({ required: true })
const store = useRecetarioStore()

const opcionesIngrediente = computed(() => store.ingredientes.map((i) => ({ id: i.id, label: i.nombre })))

function elegirIngrediente(fila: IngredientRow, id: number) {
  fila.ingredienteId = id
  fila.nombrePendiente = null
  fila.query = ''
}

function proponerNuevo(fila: IngredientRow, texto: string) {
  fila.nombrePendiente = texto
  fila.ingredienteId = null
  fila.query = ''
}

function limpiarFila(fila: IngredientRow) {
  fila.ingredienteId = null
  fila.nombrePendiente = null
  fila.query = ''
}

function anadirFila() {
  filas.value = [...filas.value, emptyIngredientRow()]
}

function eliminarFila(index: number) {
  filas.value = filas.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="ingredientes">
    <tp-section-header
      title="Ingredientes"
      hint="Elige de la lista del catálogo. Si no existe, puedes proponer uno nuevo y quedará pendiente de validación."
    >
      <tp-button variant="link" @click="anadirFila">+ Añadir ingrediente</tp-button>
    </tp-section-header>

    <div v-for="(fila, index) in filas" :key="index" class="fila">
      <div class="campo-ingrediente">
        <div v-if="fila.ingredienteId || fila.nombrePendiente" class="elegido">
          <span class="elegido__nombre">{{ fila.ingredienteId ? store.ingredientePorId(fila.ingredienteId)?.nombre : fila.nombrePendiente }}</span>
          <span v-if="fila.nombrePendiente" class="pendiente">Pendiente de validación</span>
          <tp-button variant="icon" icon="close" aria-label="Cambiar ingrediente" @click="limpiarFila(fila)" />
        </div>
        <tp-autocomplete
          v-else
          v-model="fila.query"
          :options="opcionesIngrediente"
          placeholder="Buscar ingrediente del catálogo…"
          aria-label="Ingrediente"
          create-label='Proponer "{query}" como ingrediente nuevo'
          @select="elegirIngrediente(fila, $event)"
          @create="proponerNuevo(fila, $event)"
        />
      </div>
      <tp-input v-model="fila.cantidad" type="number" min="0" step="any" placeholder="Cantidad" aria-label="Cantidad" class="cantidad" />
      <tp-select v-model="fila.unidad" aria-label="Unidad" class="unidad">
        <option v-for="u in UNIDADES" :key="u.valor" :value="u.valor">{{ u.etiqueta }}</option>
      </tp-select>
      <tp-button variant="icon" icon="close" aria-label="Eliminar ingrediente" @click="eliminarFila(index)" />
    </div>
  </div>
</template>

<style scoped>
.ingredientes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fila {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.campo-ingrediente {
  flex: 1 1 100%;
  position: relative;
}

.elegido {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 9px 12px;
  background: var(--paper);
  min-height: 19px;
}

.elegido__nombre {
  flex: 1;
  font-size: 14px;
}

.pendiente {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--terracotta);
  background: var(--terracotta-tint);
  padding: 3px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.cantidad {
  flex: 1 1 90px;
  min-width: 0;
}

.unidad {
  flex: 1 1 110px;
  min-width: 0;
}

@media (min-width: 640px) {
  .campo-ingrediente {
    flex: 2 1 0;
    min-width: 0;
  }
}
</style>
