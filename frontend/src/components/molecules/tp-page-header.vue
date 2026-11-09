<script setup lang="ts">

defineSlots<{
  /** Acciones a la derecha del título (p. ej. un botón). */
  default?(): unknown
}>()
defineProps<{
  /** Título principal de la página (h1). */
  title: string
  /** Línea de apoyo bajo el título. */
  subtitle?: string
}>()
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header__subtitle {
  font-size: 13.5px;
  color: var(--ink-soft);
  margin: 6px 0 0;
}
</style>
