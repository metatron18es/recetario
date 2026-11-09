<script setup lang="ts">
import { computed } from 'vue'
import { ICONOS, type NombreIcono } from './tp-icon'

const props = withDefaults(
  defineProps<{
    /** Nombre del icono: el de un fichero de `assets/icons`, sin `.svg`. */
    name: NombreIcono
    /** Lado del icono en píxeles. */
    size?: number
    /** Nombre de un color de la paleta (una custom property de `main.css`, sin `--`). Si falta, hereda el color del texto. */
    color?: string
  }>(),
  { size: 20 },
)

const icono = computed(() => ICONOS[props.name])

if (import.meta.env.DEV) {
  if (!ICONOS[props.name]) console.warn(`tp-icon: no existe el icono "${props.name}" en assets/icons`)
  // Import dinámico: la lista de colores solo se carga en desarrollo, no entra en el bundle de producción.
  if (props.color) {
    const color = props.color
    import('../../design/colors').then(({ COLORES }) => {
      if (!COLORES.includes(color)) console.warn(`tp-icon: "${color}" no es un color de la paleta`)
    })
  }
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="icono?.stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    :style="color ? { color: `var(--${color})` } : undefined"
    aria-hidden="true"
    v-html="icono?.body"
  ></svg>
</template>
