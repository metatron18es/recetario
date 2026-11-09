<script setup lang="ts">
import TpChip from '../atoms/tp-chip.vue'

const props = defineProps<{
  /** Opciones del grupo: `id` para identificarlas y `label` como texto visible. */
  options: { id: number; label: string }[]
  /** Ids de las opciones seleccionadas (array o `Set`). */
  selected: ReadonlySet<number> | readonly number[]
}>()

const emit = defineEmits<{
  /** Se emite al pulsar una opción con su id; el padre actualiza `selected`. */
  toggle: [id: number]
}>()

const isSelected = (id: number) => (props.selected instanceof Set ? props.selected.has(id) : (props.selected as readonly number[]).includes(id))
</script>

<template>
  <div class="tp-chip-group">
    <tp-chip v-for="option in options" :key="option.id" selectable :selected="isSelected(option.id)" @click="emit('toggle', option.id)">
      {{ option.label }}
    </tp-chip>
  </div>
</template>

<style scoped>
.tp-chip-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
