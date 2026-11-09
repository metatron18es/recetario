<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Tamaño: `md` (tarjeta normal) o `lg` (más aire y sombra, para pantallas de acceso). */
    size?: 'md' | 'lg'
  }>(),
  { size: 'md' },
)

defineSlots<{
  /** Contenido de la tarjeta. */
  default?(): unknown
}>()
</script>

<template>
  <div class="base-card" :class="`base-card--${size}`"><slot /></div>
</template>

<style scoped>
.base-card {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.base-card--lg {
  border-radius: 18px;
  padding: 44px 40px;
  gap: 28px;
  box-shadow: 0 2px 20px var(--shadow-medium);
}
</style>
