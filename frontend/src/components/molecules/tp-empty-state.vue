<script setup lang="ts">
defineSlots<{
  /** Mensaje que explica por qué no hay contenido. */
  default?(): unknown
  /** Acción opcional bajo el mensaje (p. ej. un botón o enlace). */
  action?(): unknown
}>()
</script>

<template>
  <div class="tp-empty-state">
    <p class="tp-empty-state__message"><slot /></p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.tp-empty-state {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.tp-empty-state__message {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
}
</style>
