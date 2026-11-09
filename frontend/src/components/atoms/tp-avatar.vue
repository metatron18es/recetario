<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Lado del círculo en píxeles. */
    size?: number
    /** URL de la foto. Si falta se muestra un degradado de marca. */
    src?: string
    /** Texto alternativo cuando hay foto. */
    alt?: string
  }>(),
  { size: 40, alt: '' },
)
</script>

<template>
  <img v-if="src" class="tp-avatar" :src="src" :alt="alt" :style="{ width: `${size}px`, height: `${size}px` }" />
  <span v-else class="tp-avatar tp-avatar--empty" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true"></span>
</template>

<style scoped>
.tp-avatar {
  display: block;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.tp-avatar--empty {
  background: linear-gradient(135deg, var(--terracotta-soft), var(--terracotta));
}
</style>
