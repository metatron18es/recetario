<script setup lang="ts">
import { computed, ref } from 'vue'
import TpInput from '../atoms/tp-input.vue'

const props = withDefaults(
  defineProps<{
    /** Opciones a sugerir: `id` para identificarlas y `label` como texto visible y de búsqueda. */
    options: { id: number; label: string }[]
    placeholder?: string
    /** Nombre accesible del campo (`aria-label`). */
    ariaLabel?: string
    /** Máximo de sugerencias visibles. */
    limit?: number
    /** Si se indica, ofrece crear una opción nueva cuando lo escrito no coincide con ninguna. `{query}` se sustituye por el texto escrito. */
    createLabel?: string
  }>(),
  { limit: 6 },
)

const emit = defineEmits<{
  /** Se emite al elegir una sugerencia, con su id. */
  select: [id: number]
  /** Se emite al elegir la opción de crear, con el texto escrito. */
  create: [text: string]
}>()

/** Texto escrito en el campo (`v-model`). Se vacía al elegir o crear. */
const query = defineModel<string>({ default: '' })
const open = ref(false)

const normalized = computed(() => query.value.trim().toLowerCase())
const suggestions = computed(() => {
  const list = normalized.value ? props.options.filter((o) => o.label.toLowerCase().includes(normalized.value)) : props.options
  return list.slice(0, props.limit)
})
const canCreate = computed(
  () => !!props.createLabel && normalized.value.length > 1 && !props.options.some((o) => o.label.toLowerCase() === normalized.value),
)

function pick(id: number) {
  emit('select', id)
  query.value = ''
  open.value = false
}

function create() {
  emit('create', query.value.trim())
  query.value = ''
  open.value = false
}

// Al hacer click en una sugerencia se dispara "mousedown" antes que "blur", así que
// un pequeño retraso deja tiempo a que el click se registre antes de cerrar el listado.
function closeSoon() {
  window.setTimeout(() => (open.value = false), 150)
}
</script>

<template>
  <div class="tp-autocomplete">
    <tp-input
      v-model="query"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      :aria-label="ariaLabel"
      @focus="open = true"
      @input="open = true"
      @blur="closeSoon"
    />
    <div v-if="open" class="tp-autocomplete__list">
      <button v-for="s in suggestions" :key="s.id" type="button" class="tp-autocomplete__item" @click="pick(s.id)">{{ s.label }}</button>
      <button v-if="canCreate" type="button" class="tp-autocomplete__item tp-autocomplete__item--create" @click="create">
        + {{ createLabel!.replace('{query}', query) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tp-autocomplete {
  position: relative;
}

.tp-autocomplete__list {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 10px 24px var(--shadow-strong);
  max-height: 230px;
  overflow-y: auto;
  z-index: 10;
}

.tp-autocomplete__item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid var(--line);
  padding: 10px 14px;
  font-size: 13.5px;
  color: var(--ink);
  cursor: pointer;
}

.tp-autocomplete__item--create {
  background: var(--cream);
  font-weight: 700;
  color: var(--terracotta);
}
</style>
