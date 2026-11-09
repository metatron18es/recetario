<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'

defineProps<{
  /** Enlace de la celda: la receta o, si está vacía, el listado. */
  to: RouteLocationRaw
  /** Nombre de la receta planificada. Sin nombre se muestra «+ Añadir». */
  name?: string
  /** Foto de la receta. */
  image?: string
  /** Calorías de la receta. */
  kcal?: number
}>()
</script>

<template>
  <RouterLink :to="to" class="tp-meal-cell">
    <template v-if="name">
      <img v-if="image" class="tp-meal-cell__image" :src="image" :alt="`Foto de ${name}`" />
      <div class="tp-meal-cell__name">{{ name }}</div>
      <div v-if="kcal !== undefined" class="tp-meal-cell__kcal">{{ kcal }} kcal</div>
    </template>
    <div v-else class="tp-meal-cell__empty">+ Añadir</div>
  </RouterLink>
</template>

<style scoped>
.tp-meal-cell {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px;
  min-height: 88px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
  text-decoration: none;
  color: inherit;
}

.tp-meal-cell__image {
  height: 34px;
  width: 100%;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}

.tp-meal-cell__name {
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
}

.tp-meal-cell__kcal {
  font-size: 10.5px;
  color: var(--ink-soft);
}

.tp-meal-cell__empty {
  font-size: 11.5px;
  color: var(--ink-soft);
  text-align: center;
}
</style>
