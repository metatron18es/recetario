<script setup lang="ts">
import { leerImagenes } from '../../lib/imagenes'
import TpRemovableImage from './tp-removable-image.vue'
import TpIcon from '../atoms/tp-icon.vue'

withDefaults(
  defineProps<{
    /** Texto del botón de subir. */
    label?: string
    /** Texto alternativo base de cada imagen; se le añade el número («Foto 1»). */
    itemLabel?: string
  }>(),
  { label: 'Añadir fotos', itemLabel: 'Foto' },
)

/** Imágenes como data URLs (`v-model`). */
const fotos = defineModel<string[]>({ required: true })

async function anadirFotos(event: Event) {
  const nuevas = await leerImagenes(event.target as HTMLInputElement)
  fotos.value = [...fotos.value, ...nuevas]
}

function quitarFoto(index: number) {
  fotos.value = fotos.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="fotos">
    <tp-removable-image
      v-for="(foto, index) in fotos"
      :key="index"
      :src="foto"
      :alt="`${itemLabel} ${index + 1}`"
      @remove="quitarFoto(index)"
    />
    <label class="dropzone">
      <tp-icon name="image" :size="26" color="ink-muted" />
      <span>{{ label }}</span>
      <input type="file" accept="image/*" multiple class="sr-only" @change="anadirFotos" />
    </label>
  </div>
</template>

<style scoped>
.fotos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 220px;
  flex-shrink: 0;
}

.dropzone {
  width: 104px;
  height: 104px;
  border: 1.5px dashed var(--line);
  border-radius: 12px;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--ink-soft);
  text-align: center;
  cursor: pointer;
  padding: 6px;
}
</style>
