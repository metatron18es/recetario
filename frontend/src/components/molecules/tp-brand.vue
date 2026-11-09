<script setup lang="ts">
import TpLogo from '../atoms/tp-logo.vue'

withDefaults(
  defineProps<{
    /** Tamaño: `md` (barra de navegación) o `lg` (pantallas de acceso). */
    size?: 'md' | 'lg'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <div class="tp-brand" :class="`tp-brand--${size}`">
    <tp-logo :size="size === 'lg' ? 36 : 30" />
    <span class="tp-brand__name">Tupper</span>
  </div>
</template>

<style scoped>
.tp-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tp-brand--lg {
  gap: 12px;
}

.tp-brand__name {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 17px;
}

.tp-brand--lg .tp-brand__name {
  font-size: 20px;
}
</style>
