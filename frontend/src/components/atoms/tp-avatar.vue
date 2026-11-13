<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Lado del círculo en píxeles. */
    size?: number
    /** URL de la foto. Si falta se muestra un degradado de marca. */
    src?: string
    /** Texto alternativo cuando hay foto. */
    alt?: string
    /** Nombre de la persona. Sin foto, se muestran sus iniciales. */
    name?: string
  }>(),
  { size: 40, alt: '' },
)

// Iniciales: primera letra de las dos primeras palabras del nombre ("María López" → "ML").
const iniciales = computed(() =>
  (props.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join(''),
)
</script>

<template>
  <img v-if="src" class="tp-avatar" :src="src" :alt="alt" :style="{ width: `${size}px`, height: `${size}px` }" />
  <span
    v-else
    class="tp-avatar tp-avatar--empty"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.4}px` }" aria-hidden="true"
    >{{ iniciales }}</span
  >
</template>

<style scoped>
.tp-avatar {
  display: block;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.tp-avatar--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--terracotta-soft), var(--terracotta));
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
