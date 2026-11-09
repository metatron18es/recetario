<script setup lang="ts">
import { leerImagenes } from '../../lib/imagenes'
import type { PasoPreparacion } from '../../stores/recetario'
import TpButton from '../atoms/tp-button.vue'
import TpTextarea from '../atoms/tp-textarea.vue'
import TpSectionHeader from '../molecules/tp-section-header.vue'
import TpRemovableImage from '../molecules/tp-removable-image.vue'

/** Lista de pasos de preparación (`v-model`); cada paso lleva texto y fotos opcionales. */
const pasos = defineModel<PasoPreparacion[]>({ required: true })

function anadirPaso() {
  pasos.value = [...pasos.value, { texto: '' }]
}

function eliminarPaso(index: number) {
  pasos.value = pasos.value.filter((_, i) => i !== index)
}

async function anadirImagenes(paso: PasoPreparacion, event: Event) {
  const nuevas = await leerImagenes(event.target as HTMLInputElement)
  paso.imagenes = [...(paso.imagenes ?? []), ...nuevas]
}

function quitarImagen(paso: PasoPreparacion, index: number) {
  paso.imagenes = paso.imagenes?.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="pasos">
    <tp-section-header title="Pasos de preparación" hint="La foto de cada paso es opcional.">
      <tp-button variant="link" @click="anadirPaso">+ Añadir paso</tp-button>
    </tp-section-header>

    <div v-for="(paso, index) in pasos" :key="index" class="paso">
      <div class="paso__numero">{{ index + 1 }}</div>
      <div class="paso__contenido">
        <tp-textarea v-model="paso.texto" rows="2" placeholder="Describe este paso…" aria-label="Descripción del paso" />
        <div class="paso__imagenes">
          <tp-removable-image
            v-for="(foto, fotoIndex) in paso.imagenes ?? []"
            :key="fotoIndex"
            :src="foto"
            size="sm"
            remove-label="Quitar foto del paso"
            @remove="quitarImagen(paso, fotoIndex)"
          />
          <label class="subir">
            + Añadir foto(s) (opcional)
            <input type="file" accept="image/*" multiple class="sr-only" @change="anadirImagenes(paso, $event)" />
          </label>
        </div>
      </div>
      <tp-button v-if="pasos.length > 1" variant="icon" icon="close" aria-label="Eliminar paso" @click="eliminarPaso(index)" />
    </div>
  </div>
</template>

<style scoped>
.pasos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.paso {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.paso__numero {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--green-dark);
  color: var(--paper);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 6px;
}

.paso__contenido {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.paso__imagenes {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.subir {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--green-dark);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 7px 12px;
  cursor: pointer;
  background: var(--paper);
}
</style>
