<script setup lang="ts">
defineProps<{
  /** Textos de cada elemento de la lista. */
  items: string[]
}>()
</script>

<template>
  <ul class="tp-bullet-list">
    <li v-for="(item, i) in items" :key="i" class="tp-bullet-list__item">{{ item }}</li>
  </ul>
</template>

<style scoped>
.tp-bullet-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tp-bullet-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  padding: 5px 0;
}

.tp-bullet-list__item::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--green-dark);
  flex-shrink: 0;
}
</style>
