<script setup lang="ts">
import type { Receta } from '../../stores/recetario'
import TpChip from '../atoms/tp-chip.vue'

defineProps<{
  /** Receta a mostrar: imagen o degradado, nombre, tipo de comida, tiempo y kcal. */
  recipe: Receta
}>()
</script>

<template>
  <RouterLink :to="`/recetas/${recipe.id}`" class="card">
    <img class="card-image" :src="recipe.imagenes[0]" :alt="`Foto de ${recipe.nombre}`" />
    <div class="card-body">
      <div class="card-title">{{ recipe.nombre }}</div>
      <div class="card-meta">{{ recipe.tipoComida }} · {{ recipe.tiempoPreparacionMin }} min</div>
      <tp-chip>{{ recipe.kcal }} kcal</tp-chip>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  text-decoration: none;
  color: inherit;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px var(--shadow-soft);
}

.card-image {
  height: 140px;
  width: 100%;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 15.5px;
  line-height: 1.3;
}

.card-meta {
  font-size: 12px;
  color: var(--ink-soft);
}

.card .chip {
  align-self: flex-start;
}
</style>
