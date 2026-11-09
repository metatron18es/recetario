<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Convierte la etiqueta en un botón que se puede activar y desactivar (filtros, alergias…). */
    selectable?: boolean
    /** Estado activo. Solo tiene efecto con `selectable`. */
    selected?: boolean
    /** Énfasis: `neutral` (fondo suave) o `strong` (fondo verde oscuro, para destacar el dato principal). */
    type?: 'neutral' | 'strong'
  }>(),
  { selectable: false, selected: false, type: 'neutral' },
)

defineSlots<{
  /** Texto de la etiqueta. */
  default?(): unknown
}>()
</script>

<template>
  <button v-if="selectable" type="button" class="chip chip--selectable" :class="{ 'chip--selected': selected }" :aria-pressed="selected">
    <slot />
  </button>
  <span v-else class="chip" :class="`chip--${type}`"><slot /></span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  background: var(--chip-bg);
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 13px;
  border-radius: 20px;
}

.chip--strong {
  background: var(--green-dark);
  color: var(--paper);
  padding: 7px 14px;
}

.chip--selectable {
  background: var(--paper);
  color: var(--ink-soft);
  border: 1px solid var(--line);
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
}

.chip--selected {
  background: var(--terracotta-tint);
  color: var(--terracotta);
  border-color: var(--terracotta-soft);
  font-weight: 700;
}
</style>
