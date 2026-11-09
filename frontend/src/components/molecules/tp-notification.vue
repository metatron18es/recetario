<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TpIcon from '../atoms/tp-icon.vue'
import type { NombreIcono } from '../atoms/tp-icon'

const props = withDefaults(
  defineProps<{
    /** Tipo de aviso: `info`, `success`, `warning` o `error`. Cambia colores, icono y rol de accesibilidad. */
    type?: 'info' | 'success' | 'warning' | 'error'
    /** Título en negrita sobre el mensaje. */
    title?: string
    /** Muestra el botón ✕ para cerrar la notificación. */
    dismissible?: boolean
    /** Milisegundos hasta que se cierra sola. `0` = no se cierra automáticamente. */
    duration?: number
    /** Muestra el icono del tipo. */
    icon?: boolean
  }>(),
  { type: 'info', dismissible: false, duration: 0, icon: true },
)

const emit = defineEmits<{
  /** Se emite cuando la notificación se cierra, a mano (✕) o por `duration`. */
  close: []
}>()

defineSlots<{
  /** Mensaje de la notificación. */
  default?(): unknown
}>()

const visible = ref(true)
let temporizador: number | undefined

function cerrar() {
  if (!visible.value) return
  visible.value = false
  emit('close')
}

onMounted(() => {
  if (props.duration > 0) temporizador = window.setTimeout(cerrar, props.duration)
})
onBeforeUnmount(() => window.clearTimeout(temporizador))

const icono = computed<NombreIcono>(() => (props.type === 'warning' ? 'alert' : props.type))
// Avisos y errores interrumpen al lector de pantalla; el resto se anuncia con calma.
const rol = computed(() => (props.type === 'error' || props.type === 'warning' ? 'alert' : 'status'))
</script>

<template>
  <div v-if="visible" class="tp-notification" :class="`tp-notification--${type}`" :role="rol">
    <tp-icon v-if="icon" class="tp-notification__icon" :name="icono" :size="18" />
    <div class="tp-notification__body">
      <strong v-if="title" class="tp-notification__title">{{ title }}</strong>
      <div><slot /></div>
    </div>
    <button v-if="dismissible" type="button" class="tp-notification__close" aria-label="Cerrar" @click="cerrar">
      <tp-icon name="close" :size="14" />
    </button>
  </div>
</template>

<style scoped>
.tp-notification {
  background: var(--notification-bg);
  border: 1px solid var(--notification-border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 12.5px;
  color: var(--notification-text);
  line-height: 1.5;
}

.tp-notification--info {
  --notification-bg: var(--mist);
  --notification-border: var(--line);
  --notification-text: var(--ink);
  --notification-icon: var(--ink-soft);
}

.tp-notification--success {
  --notification-bg: var(--green-tint);
  --notification-border: var(--green-border);
  --notification-text: var(--green-dark);
  --notification-icon: var(--green);
}

.tp-notification--warning {
  --notification-bg: var(--terracotta-tint);
  --notification-border: var(--terracotta-border);
  --notification-text: var(--terracotta-dark);
  --notification-icon: var(--terracotta);
}

.tp-notification--error {
  --notification-bg: var(--danger-tint);
  --notification-border: var(--danger-border);
  --notification-text: var(--danger-dark);
  --notification-icon: var(--danger);
}

.tp-notification__icon {
  color: var(--notification-icon);
}

.tp-notification__body {
  flex: 1;
}

.tp-notification__title {
  display: block;
  font-weight: 700;
}

.tp-notification__close {
  background: none;
  border: none;
  padding: 2px;
  margin: -2px;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  line-height: 0;
}

.tp-notification__close:hover {
  opacity: 1;
}
</style>
