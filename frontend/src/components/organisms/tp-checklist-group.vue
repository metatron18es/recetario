<script setup lang="ts">
defineProps<{
  /** Título del grupo (p. ej. la categoría de la compra). */
  title: string
  /** Texto secundario a la derecha del título (p. ej. «3 pendientes»). */
  hint?: string
}>()

defineSlots<{
  /** Los `tp-checklist-item` del grupo. */
  default?(): unknown
}>()
</script>

<template>
  <section class="tp-checklist-group">
    <header class="tp-checklist-group__header">
      <span>{{ title }}</span>
      <span v-if="hint" class="tp-checklist-group__hint">{{ hint }}</span>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.tp-checklist-group {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}

.tp-checklist-group__header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--green-dark);
}

.tp-checklist-group__hint {
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 500;
}
</style>
