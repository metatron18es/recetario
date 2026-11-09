<script setup lang="ts">
import TpIcon from '../atoms/tp-icon.vue'

defineProps<{
  /** Texto principal. Se tacha y atenúa al marcarlo. */
  label: string
  /** Texto secundario a la derecha (p. ej. la cantidad). */
  detail?: string
}>()

/** Estado marcado (`v-model`). */
const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="tp-checklist-item">
    <input v-model="checked" type="checkbox" class="sr-only" />
    <span class="tp-checklist-item__box" :class="{ 'tp-checklist-item__box--checked': checked }">
      <tp-icon v-if="checked" name="check" :size="12" color="paper" />
    </span>
    <span class="tp-checklist-item__label" :class="{ 'tp-checklist-item__label--checked': checked }">{{ label }}</span>
    <span v-if="detail" class="tp-checklist-item__detail">{{ detail }}</span>
  </label>
</template>

<style scoped>
.tp-checklist-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}

.tp-checklist-item:last-child {
  border-bottom: none;
}

.tp-checklist-item__box {
  width: 19px;
  height: 19px;
  border-radius: 6px;
  border: 1.6px solid var(--line);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper);
}

.tp-checklist-item__box--checked {
  background: var(--green-dark);
  border-color: var(--green-dark);
}

.tp-checklist-item input:focus-visible + .tp-checklist-item__box {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}

.tp-checklist-item__label {
  flex: 1;
  font-size: 14px;
}

.tp-checklist-item__label--checked {
  color: var(--ink-muted);
  text-decoration: line-through;
}

.tp-checklist-item__detail {
  font-size: 12.5px;
  color: var(--ink-soft);
}
</style>
