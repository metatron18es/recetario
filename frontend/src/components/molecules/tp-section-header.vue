<script setup lang="ts">

defineSlots<{
  /** Contenido opcional a la derecha (p. ej. un botón «Añadir»). */
  default?(): unknown
}>()
defineProps<{
  /** Título de la sección. */
  title: string
  /** Texto pequeño de ayuda junto al título (p. ej. «Al menos uno»). */
  hint?: string
}>()
</script>

<template>
  <div class="section-header">
    <div>
      <h3 class="section-header__title">{{ title }}</h3>
      <p v-if="hint" class="section-header__hint">{{ hint }}</p>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.section-header__title {
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--ink-soft);
  margin: 0 0 4px;
}

.section-header__hint {
  font-size: 12px;
  color: var(--ink-soft);
  margin: 0;
}
</style>
