<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Lado del logo en píxeles (es cuadrado). */
    size?: number
  }>(),
  { size: 32 },
)
</script>

<template>
  <div class="tp-logo" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size * 0.65" :height="size * 0.65" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect class="tp-logo__lid" x="3.5" y="5.5" width="17" height="4" rx="1.4" />
      <path
        class="tp-logo__body"
        d="M5.2 9.5 6.3 17.6A2 2 0 0 0 8.3 19.3h7.4a2 2 0 0 0 2-1.7l1.1-8.1"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.tp-logo {
  border-radius: 28%;
  background: var(--green-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tp-logo__lid {
  fill: var(--terracotta);
}

.tp-logo__body {
  stroke: var(--cream);
}
</style>
