<script setup lang="ts">
import TpButton from '../atoms/tp-button.vue'

withDefaults(
  defineProps<{
    /** URL de la imagen (también vale un data URL). */
    src: string
    /** Texto alternativo para lectores de pantalla. */
    alt?: string
    /** Tamaño de la miniatura: `md` (normal) o `sm` (compacta, p. ej. fotos de un paso). */
    size?: 'md' | 'sm'
    /** Texto accesible (`aria-label`) del botón de quitar. */
    removeLabel?: string
  }>(),
  {
    alt: '',
    size: 'md',
    removeLabel: 'Quitar foto',
  },
)

defineEmits<{
  /** Se emite al pulsar el botón de quitar; quien usa el componente decide cómo eliminar la imagen. */
  remove: []
}>()
</script>

<template>
  <div class="imagen" :class="`imagen--${size}`">
    <img :src="src" :alt="alt" />
    <tp-button variant="icon" icon="close" class="imagen__quitar" :aria-label="removeLabel" @click="$emit('remove')" />
  </div>
</template>

<style scoped>
.imagen {
  position: relative;
  flex-shrink: 0;
}

.imagen--md {
  width: 104px;
  height: 104px;
  border-radius: 12px;
}

.imagen--md img {
  border-radius: 12px;
}

.imagen--sm {
  width: 48px;
  height: 48px;
}

.imagen--sm img {
  border-radius: 8px;
  border: 1px solid var(--line);
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.imagen .imagen__quitar {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  background: var(--scrim);
  color: var(--paper);
}

.imagen .imagen__quitar :deep(svg) {
  width: 10px;
  height: 10px;
}

.imagen--sm .imagen__quitar {
  width: 16px;
  height: 16px;
  top: -5px;
  right: -5px;
}
</style>
