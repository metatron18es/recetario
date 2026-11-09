<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import TpIcon from './tp-icon.vue'
import type { NombreIcono } from './tp-icon'

defineSlots<{
  /** Texto o contenido del botón. */
  default?(): unknown
}>()

withDefaults(
  defineProps<{
    /** Aspecto del botón: `primary` (acción principal), `secondary` (contorno), `ghost` (sin fondo), `link` (parece un enlace) o `icon` (solo icono). */
    variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'icon'
    /** Ruta de destino. Si se indica, se renderiza como enlace (`<a>`) en vez de `<button>` y `type` se ignora. */
    to?: RouteLocationRaw
    /** Tipo nativo del `<button>`: `button` no hace nada por sí solo; `submit` envía el formulario que lo contiene. Solo aplica cuando no hay `to`. */
    type?: 'button' | 'submit'
    /** Icono del catálogo (`tp-icon`) que acompaña al texto; hereda el color del botón. */
    icon?: NombreIcono
    /** Lado del texto en el que va el icono: `start` (antes) o `end` (después). */
    iconPosition?: 'start' | 'end'
  }>(),
  { variant: 'primary', type: 'button', iconPosition: 'start' },
)
</script>

<template>
  <RouterLink v-if="to" :to="to" class="btn" :class="`btn--${variant}`">
    <tp-icon v-if="icon && iconPosition === 'start'" :name="icon" :size="14" />
    <slot />
    <tp-icon v-if="icon && iconPosition === 'end'" :name="icon" :size="14" />
  </RouterLink>
  <button v-else :type="type" class="btn" :class="`btn--${variant}`">
    <tp-icon v-if="icon && iconPosition === 'start'" :name="icon" :size="14" />
    <slot />
    <tp-icon v-if="icon && iconPosition === 'end'" :name="icon" :size="14" />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--green-dark);
  color: var(--paper);
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
}

.btn--primary:hover {
  color: var(--paper);
}

.btn--secondary {
  background: transparent;
  color: var(--green-dark);
  border: 1.5px solid var(--green-dark);
  border-radius: 10px;
  padding: 11px 22px;
}

.btn--secondary:hover {
  color: var(--green-dark);
}

.btn--ghost {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--ink);
}

.btn--link {
  width: fit-content;
  background: transparent;
  color: var(--green-dark);
  border: none;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.btn--icon {
  background: none;
  border: none;
  color: var(--ink-soft);
  font-size: 15px;
  padding: 0 2px;
}
</style>
