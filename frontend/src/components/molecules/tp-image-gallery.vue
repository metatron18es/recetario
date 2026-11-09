<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  /** URLs de las imágenes. Con más de una se muestran las miniaturas. */
  images: string[]
  /** Texto alternativo base; a las miniaturas se les añade el número. */
  alt: string
}>()

const active = ref(0)
</script>

<template>
  <div class="tp-image-gallery">
    <img class="tp-image-gallery__hero" :src="images[active]" :alt="alt" />
    <div v-if="images.length > 1" class="tp-image-gallery__thumbs">
      <button
        v-for="(image, i) in images"
        :key="i"
        type="button"
        class="tp-image-gallery__thumb"
        :class="{ 'tp-image-gallery__thumb--active': i === active }"
        :aria-pressed="i === active"
        @click="active = i"
      >
        <img :src="image" :alt="`${alt} ${i + 1}`" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.tp-image-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tp-image-gallery__hero {
  height: 300px;
  width: 100%;
  object-fit: cover;
  display: block;
  border-radius: 16px;
}

.tp-image-gallery__thumbs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tp-image-gallery__thumb {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.tp-image-gallery__thumb--active {
  border-color: var(--green-dark);
}

.tp-image-gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
