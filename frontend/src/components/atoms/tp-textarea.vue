<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  /** Etiqueta visible encima del área de texto; se asocia al control para accesibilidad. */
  label?: string
  /** `id` del control. Si no se indica se genera uno único automáticamente. */
  id?: string
}>()
/** Texto del área (`v-model`). */
const model = defineModel<string | number>()
const attrs = useAttrs()
const uid = useId()
const controlId = computed(() => props.id ?? uid)
// class y style van al contenedor (para poder dimensionar el campo); el resto, al control.
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
</script>

<template>
  <div class="field" :class="attrs.class" :style="attrs.style as any">
    <div v-if="label" class="field__head">
      <label :for="controlId">{{ label }}</label>
    </div>
    <textarea :id="controlId" v-model="model" v-bind="controlAttrs" class="field__control"></textarea>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--ink-soft);
}

.field__control {
  font-size: 14px;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 11px 13px;
  width: 100%;
  background: var(--paper);
  color: var(--ink);
  resize: vertical;
}

.field__control:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 1px;
}
</style>
