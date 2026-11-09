<script setup lang="ts">
defineProps<{
  /** Pasos en orden: texto y fotos opcionales (URLs). */
  steps: { texto: string; imagenes?: string[] }[]
}>()
</script>

<template>
  <ol class="tp-step-list">
    <li v-for="(step, i) in steps" :key="i" class="tp-step-list__step">
      <span class="tp-step-list__number">{{ i + 1 }}</span>
      <div class="tp-step-list__body">
        <div class="tp-step-list__text">{{ step.texto }}</div>
        <div v-if="step.imagenes?.length" class="tp-step-list__images">
          <img v-for="(image, j) in step.imagenes" :key="j" :src="image" :alt="`Foto ${j + 1} del paso ${i + 1}`" />
        </div>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.tp-step-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tp-step-list__step {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.tp-step-list__number {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--green-dark);
  color: var(--paper);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tp-step-list__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tp-step-list__text {
  font-size: 13.5px;
  line-height: 1.5;
  padding-top: 2px;
}

.tp-step-list__images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tp-step-list__images img {
  width: 160px;
  max-width: 100%;
  height: 120px;
  border-radius: 10px;
  object-fit: cover;
}
</style>
